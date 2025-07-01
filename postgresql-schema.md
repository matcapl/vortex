# PostgreSQL Database Schema for Private Equity Multi-Dimensional Dashboard

## Database Schema Design

This document outlines the PostgreSQL database schema for the private equity multi-dimensional funnel dashboard, designed to track and visualize the complete investment pipeline from game selection to value creation.

### Core Tables

#### 1. Games Table
```sql
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    game_name VARCHAR(255) NOT NULL,
    total_market_size_bn DECIMAL(10,2),
    growth_rate_percent DECIMAL(5,2),
    competition_level VARCHAR(50) CHECK (competition_level IN ('Low', 'Medium', 'High')),
    regulatory_risk VARCHAR(50) CHECK (regulatory_risk IN ('Low', 'Medium', 'High')),
    analysis_stage VARCHAR(100) CHECK (analysis_stage IN ('Initial Screen', 'Deep Dive', 'Thesis Development', 'Active Monitoring')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Companies Table
```sql
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    game_id INTEGER REFERENCES games(game_id),
    revenue_mm DECIMAL(10,2),
    ebitda_mm DECIMAL(10,2),
    enterprise_value_mm DECIMAL(12,2),
    geographic_region VARCHAR(100),
    stage VARCHAR(100) CHECK (stage IN ('Screening', 'Initial Due Diligence', 'Advanced DD', 'LOI Submitted', 'Negotiation', 'Closed', 'Passed')),
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
    strategic_fit_score INTEGER CHECK (strategic_fit_score BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Origination Table
```sql
CREATE TABLE origination (
    origination_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id),
    source_type VARCHAR(100) CHECK (source_type IN ('Investment Bank', 'Direct Outreach', 'Network Referral', 'Intermediary', 'Auction Process', 'Proprietary')),
    contact_date DATE,
    contact_quality VARCHAR(50) CHECK (contact_quality IN ('Cold', 'Warm', 'Hot')),
    follow_up_status VARCHAR(100) CHECK (follow_up_status IN ('No Response', 'Initial Interest', 'NDA Signed', 'CIM Received', 'Management Meeting')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Talent Table
```sql
CREATE TABLE talent (
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) CHECK (type IN ('External CEO', 'External Chairman', 'Internal MCL', 'Internal MTL', 'Board Member', 'Advisor')),
    experience_years INTEGER,
    sector_expertise INTEGER REFERENCES games(game_id),
    availability VARCHAR(50) CHECK (availability IN ('Available', 'Limited', 'Committed')),
    compensation_expectation VARCHAR(50) CHECK (compensation_expectation IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Investments Table
```sql
CREATE TABLE investments (
    investment_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id),
    investment_date DATE,
    initial_investment_mm DECIMAL(12,2),
    ownership_percent DECIMAL(5,2),
    entry_multiple DECIMAL(5,2),
    debt_to_equity_ratio DECIMAL(5,2),
    investment_stage VARCHAR(50) CHECK (investment_stage IN ('Platform', 'Add-on', 'Follow-on')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Capital Allocation Table
```sql
CREATE TABLE capital_allocation (
    allocation_id SERIAL PRIMARY KEY,
    fund_name VARCHAR(100),
    committed_capital_mm DECIMAL(12,2),
    deployed_capital_mm DECIMAL(12,2),
    available_capital_mm DECIMAL(12,2),
    allocation_date DATE,
    allocation_type VARCHAR(100) CHECK (allocation_type IN ('Initial Investment', 'Follow-on', 'Bridge Financing', 'Exit Preparation')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Performance Tracking Table
```sql
CREATE TABLE performance_tracking (
    performance_id SERIAL PRIMARY KEY,
    investment_id INTEGER REFERENCES investments(investment_id),
    reporting_date DATE,
    revenue_growth_percent DECIMAL(8,2),
    ebitda_growth_percent DECIMAL(8,2),
    multiple_expansion DECIMAL(5,2),
    operational_improvements_mm DECIMAL(10,2),
    cost_savings_mm DECIMAL(10,2),
    market_share_change_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance Optimization

```sql
-- Indexes for faster queries
CREATE INDEX idx_companies_game_id ON companies(game_id);
CREATE INDEX idx_companies_stage ON companies(stage);
CREATE INDEX idx_origination_company_id ON origination(company_id);
CREATE INDEX idx_investments_company_id ON investments(company_id);
CREATE INDEX idx_performance_investment_id ON performance_tracking(investment_id);
CREATE INDEX idx_performance_reporting_date ON performance_tracking(reporting_date);
CREATE INDEX idx_capital_allocation_date ON capital_allocation(allocation_date);
```

### Views for Dashboard Queries

#### Inward Funnel View
```sql
CREATE VIEW inward_funnel_view AS
SELECT 
    'Games Analyzed' as stage,
    COUNT(*) as count,
    SUM(total_market_size_bn * 1000) as value_mm,
    1 as stage_order
FROM games
UNION ALL
SELECT 
    'Companies Identified' as stage,
    COUNT(*) as count,
    SUM(enterprise_value_mm) as value_mm,
    2 as stage_order
FROM companies
UNION ALL
SELECT 
    'Active Pipeline' as stage,
    COUNT(*) as count,
    SUM(enterprise_value_mm) as value_mm,
    3 as stage_order
FROM companies 
WHERE stage NOT IN ('Passed')
UNION ALL
SELECT 
    'Due Diligence' as stage,
    COUNT(*) as count,
    SUM(enterprise_value_mm) as value_mm,
    4 as stage_order
FROM companies 
WHERE stage IN ('Initial Due Diligence', 'Advanced DD', 'LOI Submitted', 'Negotiation', 'Closed')
UNION ALL
SELECT 
    'Investments Closed' as stage,
    COUNT(*) as count,
    SUM(enterprise_value_mm) as value_mm,
    5 as stage_order
FROM companies 
WHERE stage = 'Closed'
ORDER BY stage_order;
```

#### Outward Funnel View
```sql
CREATE VIEW outward_funnel_view AS
SELECT 
    'Initial Investment' as stage,
    COUNT(*) as count,
    SUM(initial_investment_mm) as value_mm,
    1 as stage_order
FROM investments
UNION ALL
SELECT 
    'Revenue Growth' as stage,
    COUNT(DISTINCT p.investment_id) as count,
    SUM(i.initial_investment_mm * (1 + AVG(p.revenue_growth_percent)/100)) as value_mm,
    2 as stage_order
FROM investments i
JOIN performance_tracking p ON i.investment_id = p.investment_id
WHERE p.revenue_growth_percent > 0
UNION ALL
SELECT 
    'EBITDA Growth' as stage,
    COUNT(DISTINCT p.investment_id) as count,
    SUM(i.initial_investment_mm * (1 + AVG(p.ebitda_growth_percent)/100)) as value_mm,
    3 as stage_order
FROM investments i
JOIN performance_tracking p ON i.investment_id = p.investment_id
WHERE p.ebitda_growth_percent > 0
UNION ALL
SELECT 
    'Multiple Expansion' as stage,
    COUNT(DISTINCT p.investment_id) as count,
    SUM(i.initial_investment_mm * AVG(p.multiple_expansion)) as value_mm,
    4 as stage_order
FROM investments i
JOIN performance_tracking p ON i.investment_id = p.investment_id
WHERE p.multiple_expansion > 1
ORDER BY stage_order;
```

### Data Initialization Script

```sql
-- Insert sample data initialization
-- (This would be populated from the CSV files in a real implementation)

-- Example trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_origination_updated_at BEFORE UPDATE ON origination 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_updated_at BEFORE UPDATE ON talent 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capital_allocation_updated_at BEFORE UPDATE ON capital_allocation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_tracking_updated_at BEFORE UPDATE ON performance_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Key Features

1. **Referential Integrity**: Foreign key constraints ensure data consistency
2. **Data Validation**: Check constraints validate enum values and ranges
3. **Performance Optimization**: Strategic indexes for common query patterns
4. **Audit Trail**: Created/updated timestamps on all tables
5. **Views**: Pre-built views for common dashboard queries
6. **Scalability**: Designed to handle growth in data volume

## Usage Notes

- The schema supports the multi-dimensional funnel visualization
- Views provide optimized queries for dashboard rendering
- Indexes ensure fast performance even with large datasets
- Constraints maintain data quality and consistency
- Timestamps enable audit trails and time-based analysis
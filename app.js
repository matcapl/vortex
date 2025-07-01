// Application Data
const appData = {
  "inward_funnel": [
    {"stage": "Games Analyzed", "count": 50, "value_mm": 1232.31, "stage_order": 1},
    {"stage": "Companies Identified", "count": 200, "value_mm": 8221.35, "stage_order": 2},
    {"stage": "Initial Screening", "count": 182, "value_mm": 7452.85, "stage_order": 3},
    {"stage": "Due Diligence", "count": 125, "value_mm": 5560.00, "stage_order": 4},
    {"stage": "LOI Stage", "count": 47, "value_mm": 2476.62, "stage_order": 5},
    {"stage": "Negotiations", "count": 35, "value_mm": 1891.23, "stage_order": 6},
    {"stage": "Investments Closed", "count": 10, "value_mm": 1069.31, "stage_order": 7}
  ],
  "outward_funnel": [
    {"stage": "Initial Investment", "count": 30, "value_mm": 1069.31, "stage_order": 1},
    {"stage": "Operational Improvements", "count": 120, "value_mm": 589.45, "stage_order": 2},
    {"stage": "Revenue Growth", "count": 108, "value_mm": 1190.33, "stage_order": 3},
    {"stage": "EBITDA Growth", "count": 110, "value_mm": 1241.01, "stage_order": 4},
    {"stage": "Multiple Expansion", "count": 71, "value_mm": 1198.11, "stage_order": 5},
    {"stage": "Value Creation", "count": 45, "value_mm": 1587.46, "stage_order": 6}
  ],
  "summary_stats": {
    "total_games_analyzed": 50,
    "companies_in_pipeline": 182,
    "active_investments": 30,
    "total_capital_deployed": 14153.79,
    "total_capital_committed": 25586.49,
    "average_revenue_growth": 11.32,
    "average_ebitda_growth": 16.06,
    "pipeline_conversion_rate": 15.0
  },
  "sectors": [
    {"name": "Healthcare Tech", "count": 12, "value_mm": 450.2},
    {"name": "FinTech", "count": 8, "value_mm": 320.5},
    {"name": "EdTech", "count": 6, "value_mm": 180.3},
    {"name": "PropTech", "count": 4, "value_mm": 290.1},
    {"name": "Other", "count": 170, "value_mm": 6980.25}
  ],
  "capital_timeline": [
    {"period": "2023-01", "deployed": 45.2, "committed": 120.5, "available": 75.3},
    {"period": "2023-02", "deployed": 67.8, "committed": 140.2, "available": 72.4},
    {"period": "2023-03", "deployed": 89.1, "committed": 165.8, "available": 76.7},
    {"period": "2023-04", "deployed": 112.3, "committed": 185.6, "available": 73.3},
    {"period": "2023-05", "deployed": 134.7, "committed": 210.4, "available": 75.7},
    {"period": "2023-06", "deployed": 156.9, "committed": 235.1, "available": 78.2}
  ],
  "investment_performance": [
    {"investment_id": 1, "company_name": "Company_1", "initial_investment": 45.2, "revenue_growth": 12.5, "ebitda_growth": 18.3, "multiple_expansion": 1.4},
    {"investment_id": 2, "company_name": "Company_2", "initial_investment": 67.8, "revenue_growth": 8.9, "ebitda_growth": 14.2, "multiple_expansion": 1.2},
    {"investment_id": 3, "company_name": "Company_3", "initial_investment": 89.4, "revenue_growth": 15.6, "ebitda_growth": 22.1, "multiple_expansion": 1.6},
    {"investment_id": 4, "company_name": "Company_4", "initial_investment": 34.7, "revenue_growth": 6.3, "ebitda_growth": 11.8, "multiple_expansion": 1.1},
    {"investment_id": 5, "company_name": "Company_5", "initial_investment": 78.9, "revenue_growth": 19.2, "ebitda_growth": 25.4, "multiple_expansion": 1.8}
  ]
};

// Chart colors
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Global variables for charts
let capitalTimelineChart, performanceChart, sectorChart;
let currentMetric = 'count';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  updateHeaderStats();
  renderFunnels();
  initializeCharts();
  populatePerformanceTable();
  setupEventListeners();
}

function updateHeaderStats() {
  const stats = appData.summary_stats;
  
  document.getElementById('totalGames').textContent = stats.total_games_analyzed;
  document.getElementById('activePipeline').textContent = stats.companies_in_pipeline;
  document.getElementById('activeInvestments').textContent = stats.active_investments;
  document.getElementById('totalCapital').textContent = `$${(stats.total_capital_deployed / 1000).toFixed(1)}B`;
  
  // Update center value
  document.getElementById('centerValue').textContent = `$${(stats.total_capital_deployed / 1000).toFixed(1)}B`;
}

function renderFunnels() {
  renderInwardFunnel();
  renderOutwardFunnel();
}

function renderInwardFunnel() {
  const container = document.getElementById('inwardFunnel');
  const maxValue = Math.max(...appData.inward_funnel.map(stage => currentMetric === 'count' ? stage.count : stage.value_mm));
  
  container.innerHTML = '';
  
  appData.inward_funnel.forEach(stage => {
    const value = currentMetric === 'count' ? stage.count : stage.value_mm;
    const percentage = (value / maxValue) * 100;
    
    const stageElement = document.createElement('div');
    stageElement.className = 'funnel-stage';
    stageElement.style.setProperty('--stage-width', `${Math.max(percentage, 10)}%`);
    
    stageElement.innerHTML = `
      <div class="stage-header">
        <span class="stage-name">${stage.stage}</span>
        <span class="stage-count">${currentMetric === 'count' ? stage.count : formatCurrency(stage.value_mm)}</span>
      </div>
      <div class="stage-value">${currentMetric === 'count' ? formatCurrency(stage.value_mm) : `${stage.count} companies`}</div>
    `;
    
    // Add click handler
    stageElement.addEventListener('click', () => handleStageClick('inward', stage));
    
    // Add hover tooltip
    stageElement.addEventListener('mouseenter', (e) => showTooltip(e, stage, 'inward'));
    stageElement.addEventListener('mouseleave', hideTooltip);
    
    container.appendChild(stageElement);
  });
}

function renderOutwardFunnel() {
  const container = document.getElementById('outwardFunnel');
  const maxValue = Math.max(...appData.outward_funnel.map(stage => currentMetric === 'count' ? stage.count : stage.value_mm));
  
  container.innerHTML = '';
  
  appData.outward_funnel.forEach(stage => {
    const value = currentMetric === 'count' ? stage.count : stage.value_mm;
    const percentage = (value / maxValue) * 100;
    
    const stageElement = document.createElement('div');
    stageElement.className = 'funnel-stage';
    stageElement.style.setProperty('--stage-width', `${Math.max(percentage, 10)}%`);
    
    stageElement.innerHTML = `
      <div class="stage-header">
        <span class="stage-name">${stage.stage}</span>
        <span class="stage-count">${currentMetric === 'count' ? stage.count : formatCurrency(stage.value_mm)}</span>
      </div>
      <div class="stage-value">${currentMetric === 'count' ? formatCurrency(stage.value_mm) : `${stage.count} initiatives`}</div>
    `;
    
    // Add click handler
    stageElement.addEventListener('click', () => handleStageClick('outward', stage));
    
    // Add hover tooltip
    stageElement.addEventListener('mouseenter', (e) => showTooltip(e, stage, 'outward'));
    stageElement.addEventListener('mouseleave', hideTooltip);
    
    container.appendChild(stageElement);
  });
}

function initializeCharts() {
  initializeCapitalTimelineChart();
  initializePerformanceChart();
  initializeSectorChart();
}

function initializeCapitalTimelineChart() {
  const ctx = document.getElementById('capitalTimelineChart').getContext('2d');
  
  capitalTimelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: appData.capital_timeline.map(item => {
        const date = new Date(item.period + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Deployed Capital',
          data: appData.capital_timeline.map(item => item.deployed),
          borderColor: chartColors[0],
          backgroundColor: chartColors[0] + '20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Committed Capital',
          data: appData.capital_timeline.map(item => item.committed),
          borderColor: chartColors[1],
          backgroundColor: chartColors[1] + '20',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Available Capital',
          data: appData.capital_timeline.map(item => item.available),
          borderColor: chartColors[2],
          backgroundColor: chartColors[2] + '20',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Capital ($M)'
          }
        }
      }
    }
  });
}

function initializePerformanceChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  
  performanceChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Investment Performance',
        data: appData.investment_performance.map(investment => ({
          x: investment.revenue_growth,
          y: investment.ebitda_growth,
          r: investment.initial_investment / 5,
          company: investment.company_name
        })),
        backgroundColor: chartColors[0] + '80',
        borderColor: chartColors[0]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const point = context.raw;
              return `${point.company}: Revenue ${point.x}%, EBITDA ${point.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Revenue Growth (%)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'EBITDA Growth (%)'
          }
        }
      }
    }
  });
}

function initializeSectorChart() {
  const ctx = document.getElementById('sectorChart').getContext('2d');
  
  sectorChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: appData.sectors.map(sector => sector.name),
      datasets: [{
        data: appData.sectors.map(sector => sector.value_mm),
        backgroundColor: chartColors.slice(0, appData.sectors.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const sector = appData.sectors[context.dataIndex];
              return `${sector.name}: $${sector.value_mm.toFixed(1)}M (${sector.count} companies)`;
            }
          }
        }
      }
    }
  });
}

function populatePerformanceTable() {
  const tbody = document.querySelector('#performanceTable tbody');
  tbody.innerHTML = '';
  
  appData.investment_performance.forEach(investment => {
    const row = document.createElement('tr');
    
    const status = getInvestmentStatus(investment);
    
    row.innerHTML = `
      <td>${investment.company_name}</td>
      <td>$${investment.initial_investment.toFixed(1)}M</td>
      <td>${investment.revenue_growth.toFixed(1)}%</td>
      <td>${investment.ebitda_growth.toFixed(1)}%</td>
      <td>${investment.multiple_expansion.toFixed(1)}x</td>
      <td><span class="status-badge status-badge--${status.class}">${status.text}</span></td>
    `;
    
    tbody.appendChild(row);
  });
}

function getInvestmentStatus(investment) {
  if (investment.ebitda_growth > 20) {
    return { class: 'active', text: 'High Growth' };
  } else if (investment.ebitda_growth > 15) {
    return { class: 'growing', text: 'Growing' };
  } else {
    return { class: 'mature', text: 'Stable' };
  }
}

function setupEventListeners() {
  // Metric selection
  document.getElementById('metricSelect').addEventListener('change', (e) => {
    currentMetric = e.target.value;
    renderFunnels();
  });
  
  // Time period selection
  document.getElementById('timeSelect').addEventListener('change', (e) => {
    // This would typically filter data by time period
    console.log('Time period changed to:', e.target.value);
  });
  
  // Sector selection
  document.getElementById('sectorSelect').addEventListener('change', (e) => {
    // This would typically filter data by sector
    console.log('Sector changed to:', e.target.value);
  });
}

function handleStageClick(funnelType, stage) {
  console.log(`Clicked on ${funnelType} funnel stage: ${stage.stage}`);
  // This would typically open a drill-down view or detailed modal
}

function showTooltip(event, stage, funnelType) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip show';
  tooltip.innerHTML = `
    <strong>${stage.stage}</strong><br>
    Count: ${stage.count}<br>
    Value: ${formatCurrency(stage.value_mm)}<br>
    ${funnelType === 'inward' ? 'Pipeline Stage' : 'Value Creation Stage'}
  `;
  
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
  
  document.body.appendChild(tooltip);
  
  // Store reference for cleanup
  event.target._tooltip = tooltip;
}

function hideTooltip(event) {
  if (event.target._tooltip) {
    event.target._tooltip.remove();
    delete event.target._tooltip;
  }
}

function formatCurrency(value) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  } else {
    return `$${value.toFixed(1)}M`;
  }
}

// Export for potential external use
window.Dashboard = {
  updateData: function(newData) {
    Object.assign(appData, newData);
    updateHeaderStats();
    renderFunnels();
    
    // Update charts
    if (capitalTimelineChart) {
      capitalTimelineChart.destroy();
      initializeCapitalTimelineChart();
    }
    if (performanceChart) {
      performanceChart.destroy();
      initializePerformanceChart();
    }
    if (sectorChart) {
      sectorChart.destroy();
      initializeSectorChart();
    }
    
    populatePerformanceTable();
  },
  
  getCurrentData: function() {
    return appData;
  }
};
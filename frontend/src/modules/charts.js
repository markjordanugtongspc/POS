import ApexCharts from 'apexcharts';

/* =========================================
   START COMMENT: BASE CHART CLASS
   Abstract parent wrapper for ApexCharts instances providing
   unified lifecycle management, theme synchronization, and updates.
   ========================================= */
export class BaseChart {
  constructor(elementId, customOptions = {}) {
    this.elementId = elementId;
    this.customOptions = customOptions;
    this.chart = null;
    this.element = document.getElementById(elementId);
  }

  // ==========================================
  // START: isDarkMode
  // Helper to detect if current application theme is dark mode.
  // ==========================================
  isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }
  // ==========================================
  // END: isDarkMode
  // ==========================================

  // ==========================================
  // START: render
  // Instantiates and renders the ApexCharts instance into the target container.
  // ==========================================
  render() {
    if (!this.element) {
      return null;
    }

    const options = this.getOptions();
    this.chart = new ApexCharts(this.element, options);
    this.chart.render();
    this.initThemeWatcher();
    return this.chart;
  }
  // ==========================================
  // END: render
  // ==========================================

  // ==========================================
  // START: updateOptions
  // Updates existing chart options dynamically with smooth transition.
  // ==========================================
  updateOptions(newOptions, redrawPaths = false, animate = true) {
    if (this.chart) {
      this.chart.updateOptions(newOptions, redrawPaths, animate);
    }
  }
  // ==========================================
  // END: updateOptions
  // ==========================================

  // ==========================================
  // START: destroy
  // Cleans up chart instance and removes DOM event bindings.
  // ==========================================
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  // ==========================================
  // END: destroy
  // ==========================================

  // ==========================================
  // START: initThemeWatcher
  // Listens for dark mode toggles on html element and refreshes chart styling.
  // ==========================================
  initThemeWatcher() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && this.chart) {
          const isDark = this.isDarkMode();
          this.chart.updateOptions({
            theme: {
              mode: isDark ? 'dark' : 'light'
            },
            tooltip: {
              theme: isDark ? 'dark' : 'light'
            },
            grid: {
              borderColor: isDark ? '#262626' : '#f3f4f6'
            },
            xaxis: {
              labels: {
                style: {
                  colors: isDark ? '#a3a3a3' : '#737373'
                }
              }
            },
            yaxis: {
              labels: {
                style: {
                  colors: isDark ? '#a3a3a3' : '#737373'
                }
              }
            }
          }, false, false);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }
  // ==========================================
  // END: initThemeWatcher
  // ==========================================

  // Abstract method to be overridden by child classes
  getOptions() {
    return this.customOptions;
  }
}
/* =========================================
   END COMMENT: BASE CHART CLASS
   ========================================= */


/* =========================================
   START COMMENT: WEEKLY SALES CHART CLASS
   Child class extending BaseChart to render the smooth area spline
   weekly sales chart with annotations, tooltips, and custom aesthetics.
   ========================================= */
export class WeeklySalesChart extends BaseChart {
  constructor(elementId = 'weekly-sales-chart', customOptions = {}) {
    super(elementId, customOptions);
  }

  // ==========================================
  // START: getOptions
  // Generates complete configuration object for the Weekly Sales area chart.
  // ==========================================
  getOptions() {
    const isDark = this.isDarkMode();

    const defaultOptions = {
      series: [
        {
          name: 'Weekly Sales',
          data: [0, 520000, 135000, 200000, 480000, 180000, 0]
        }
      ],
      chart: {
        type: 'area',
        height: 200,
        parentHeightOffset: 0,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        fontFamily: 'Urbanist, system-ui, sans-serif'
      },
      colors: ['#10b981'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3.5,
        colors: ['#10b981']
      },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: '#10b981',
              opacity: 0.35
            },
            {
              offset: 100,
              color: '#10b981',
              opacity: 0.02
            }
          ]
        }
      },
      grid: {
        show: true,
        borderColor: isDark ? '#262626' : '#f3f4f6',
        strokeDashArray: 4,
        padding: {
          top: -15,
          right: 10,
          bottom: -5,
          left: 10
        }
      },
      xaxis: {
        categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: isDark ? '#a3a3a3' : '#737373',
            fontSize: '11px',
            fontWeight: 700
          }
        }
      },
      yaxis: {
        min: 0,
        max: 1000000,
        tickAmount: 5,
        labels: {
          formatter: (val) => {
            if (val === 0 || isNaN(val)) return '0';
            if (val >= 1000000) {
              const formattedM = val / 1000000;
              return `${Number.isInteger(formattedM) ? formattedM.toLocaleString() : formattedM.toFixed(1)}M`;
            }
            if (val >= 1000) {
              const formattedK = val / 1000;
              return `${Number.isInteger(formattedK) ? formattedK.toLocaleString() : formattedK.toFixed(1)}k`;
            }
            return Number(val).toLocaleString();
          },
          style: {
            colors: isDark ? '#a3a3a3' : '#737373',
            fontSize: '11px',
            fontWeight: 700
          }
        }
      },
      annotations: {
        yaxis: [
          {
            y: 200000,
            borderColor: '#10b981',
            strokeDashArray: 4,
            opacity: 0.85
          }
        ],
        points: [
          {
            x: 'Wed',
            y: 200000,
            marker: {
              size: 6,
              fillColor: '#10b981',
              strokeColor: '#ffffff',
              strokeWidth: 2.5,
              radius: 2
            },
            label: {
              borderColor: 'transparent',
              style: {
                color: '#ffffff',
                background: '#10b981',
                fontSize: '11px',
                fontWeight: 800,
                padding: {
                  left: 8,
                  right: 8,
                  top: 3,
                  bottom: 3
                }
              },
              text: '200k',
              offsetY: -16
            }
          }
        ]
      },
      markers: {
        size: 0,
        hover: {
          size: 6,
          sizeOffset: 3
        }
      },
      tooltip: {
        enabled: true,
        theme: isDark ? 'dark' : 'light',
        x: {
          show: true
        },
        y: {
          formatter: (val) => '₱' + val.toLocaleString(),
          title: {
            formatter: (seriesName) => `${seriesName}:`
          }
        }
      }
    };

    return { ...defaultOptions, ...this.customOptions };
  }
  // ==========================================
  // END: getOptions
  // ==========================================
}
/* =========================================
   END COMMENT: WEEKLY SALES CHART CLASS
   ========================================= */

// ==========================================
// START: initWeeklySalesChart
// Factory function to initialize the WeeklySalesChart instance if container exists.
// ==========================================
export function initWeeklySalesChart() {
  const chartEl = document.getElementById('weekly-sales-chart');
  if (!chartEl) return null;

  const weeklyChart = new WeeklySalesChart('weekly-sales-chart');
  return weeklyChart.render();
}
// ==========================================
// END: initWeeklySalesChart
// ==========================================

/* =========================================
   START COMMENT: ADMIN DOUBLE LINE CHART CLASS
   Flowbite & ApexCharts double line chart displaying platform gross revenue
   and subscription trends across all 12 calendar months with dark mode sync.
   ========================================= */
export class AdminDoubleLineChart extends BaseChart {
  constructor(elementId = 'admin-double-line-chart', customOptions = {}) {
    super(elementId, customOptions);
  }

  // ==========================================
  // START: getOptions
  // Generates complete configuration object for the Admin Double Line chart.
  // ==========================================
  getOptions() {
    const isDark = this.isDarkMode();

    const defaultOptions = {
      series: [
        {
          name: 'Gross Platform Revenue',
          data: [185000, 240000, 310000, 290000, 420000, 480000, 560000, 610000, 720000, 850000, 930000, 1150000]
        },
        {
          name: 'Active Merchant Settlements',
          data: [110000, 155000, 195000, 210000, 280000, 340000, 390000, 440000, 520000, 610000, 710000, 890000]
        }
      ],
      chart: {
        type: 'line',
        height: 280,
        parentHeightOffset: 0,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        fontFamily: 'Urbanist, system-ui, sans-serif'
      },
      colors: ['#e11d48', '#059669'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: [3.5, 3.5]
      },
      grid: {
        show: true,
        borderColor: isDark ? '#262626' : '#f3f4f6',
        strokeDashArray: 4,
        padding: {
          top: -10,
          right: 15,
          bottom: 0,
          left: 10
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: isDark ? '#a3a3a3' : '#737373',
            fontSize: '11px',
            fontWeight: 700
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (val) => {
            if (val === 0 || isNaN(val)) return '₱0';
            if (val >= 1000000) {
              const formattedM = val / 1000000;
              return `₱${Number.isInteger(formattedM) ? formattedM.toLocaleString() : formattedM.toFixed(1)}M`;
            }
            if (val >= 1000) {
              const formattedK = val / 1000;
              return `₱${Number.isInteger(formattedK) ? formattedK.toLocaleString() : formattedK.toFixed(0)}k`;
            }
            return '₱' + Number(val).toLocaleString();
          },
          style: {
            colors: isDark ? '#a3a3a3' : '#737373',
            fontSize: '11px',
            fontWeight: 700
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: isDark ? '#d4d4d4' : '#404040'
        },
        markers: {
          radius: 2
        }
      },
      markers: {
        size: 3.5,
        strokeWidth: 2,
        hover: {
          size: 6,
          sizeOffset: 3
        }
      },
      tooltip: {
        enabled: true,
        theme: isDark ? 'dark' : 'light',
        x: {
          show: true
        },
        y: {
          formatter: (val) => '₱' + Number(val).toLocaleString(),
          title: {
            formatter: (seriesName) => `${seriesName}:`
          }
        }
      }
    };

    return { ...defaultOptions, ...this.customOptions };
  }
  // ==========================================
  // END: getOptions
  // ==========================================
}
/* =========================================
   END COMMENT: ADMIN DOUBLE LINE CHART CLASS
   ========================================= */

// ==========================================
// START: initAdminDoubleLineChart
// Factory function to initialize the AdminDoubleLineChart instance if container exists.
// ==========================================
export function initAdminDoubleLineChart() {
  const chartEl = document.getElementById('admin-double-line-chart');
  if (!chartEl) return null;

  const adminChart = new AdminDoubleLineChart('admin-double-line-chart');
  return adminChart.render();
}
// ==========================================
// END: initAdminDoubleLineChart
// ==========================================

/* =========================================
   START COMMENT: ADMIN MINI CHARTS FOR TICKETS
   Flowbite ApexCharts sparkline widgets for Open and Resolved Ticket metrics.
   ========================================= */
export function initAdminTicketMiniCharts() {
  const isDark = document.documentElement.classList.contains('dark');

  // Mini Chart 1: Open Tickets
  const openChartEl = document.getElementById('mini-chart-open-tickets');
  if (openChartEl && !openChartEl.dataset.rendered) {
    openChartEl.dataset.rendered = 'true';
    const openOptions = {
      series: [{ name: 'Open Inquiries', data: [8, 12, 10, 15, 14, 18, 16] }],
      chart: {
        type: 'area',
        height: 85,
        sparkline: { enabled: true },
        fontFamily: 'Urbanist, sans-serif'
      },
      colors: ['#f59e0b'],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: { formatter: (val) => `${val} Tickets` }
      }
    };
    new ApexCharts(openChartEl, openOptions).render();
  }

  // Mini Chart 2: Resolved Tickets
  const resolvedChartEl = document.getElementById('mini-chart-resolved-tickets');
  if (resolvedChartEl && !resolvedChartEl.dataset.rendered) {
    resolvedChartEl.dataset.rendered = 'true';
    const resolvedOptions = {
      series: [{ name: 'Resolved Tickets', data: [22, 28, 35, 30, 42, 48, 56] }],
      chart: {
        type: 'area',
        height: 85,
        sparkline: { enabled: true },
        fontFamily: 'Urbanist, sans-serif'
      },
      colors: ['#10b981'],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: { formatter: (val) => `${val} Resolved` }
      }
    };
    new ApexCharts(resolvedChartEl, resolvedOptions).render();
  }
}
// ==========================================
// END: initAdminTicketMiniCharts
// ==========================================

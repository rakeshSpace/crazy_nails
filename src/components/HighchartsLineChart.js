import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// No need to import accessibility module - it causes issues

const HighchartsLineChart = ({ data, title, yAxisTitle, color }) => {
    const options = {
        chart: {
            type: 'area',
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Poppins, sans-serif'
            },
            height: 350,
            zoomType: 'x'
        },
        title: {
            text: title,
            style: {
                color: '#333',
                fontSize: '16px',
                fontWeight: '600'
            }
        },
        subtitle: {
            text: 'Source: Crazy Nails & Lashes',
            style: {
                color: '#777',
                fontSize: '12px'
            }
        },
        xAxis: {
            categories: data.map(item => item.month),
            title: {
                text: 'Month',
                style: {
                    color: '#777'
                }
            },
            labels: {
                rotation: -45,
                style: {
                    fontSize: '11px'
                }
            },
            crosshair: true
        },
        yAxis: {
            title: {
                text: yAxisTitle,
                style: {
                    color: '#777'
                }
            },
            labels: {
                formatter: function() {
                    return '₹' + this.value.toLocaleString();
                }
            },
            gridLineColor: '#e0e0e0',
            gridLineDashStyle: 'Dash',
            crosshair: true
        },
        tooltip: {
            shared: true,
            valuePrefix: '₹',
            valueDecimals: 0,
            backgroundColor: '#fff',
            borderColor: '#d4a574',
            borderRadius: 8,
            shadow: true,
            style: {
                color: '#333',
                fontSize: '12px'
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 0,
            y: 30,
            floating: true,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 5,
            itemStyle: {
                color: '#333',
                fontWeight: 'normal'
            }
        },
        plotOptions: {
            area: {
                fillOpacity: 0.3,
                marker: {
                    radius: 4,
                    lineColor: color || '#d4a574',
                    lineWidth: 2,
                    symbol: 'circle'
                },
                lineWidth: 2,
                lineColor: color || '#d4a574',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, color || '#d4a574'],
                        [1, 'rgba(212, 165, 116, 0.1)']
                    ]
                },
                states: {
                    hover: {
                        lineWidth: 3
                    }
                }
            }
        },
        series: [{
            name: 'Revenue',
            data: data.map(item => item.revenue),
            color: color || '#d4a574'
        }],
        credits: {
            enabled: false
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                }
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal',
                        floating: false
                    },
                    xAxis: {
                        labels: {
                            rotation: -45
                        }
                    }
                }
            }]
        }
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default HighchartsLineChart;
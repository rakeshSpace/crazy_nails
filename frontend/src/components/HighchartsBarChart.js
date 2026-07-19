import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HighchartsBarChart = ({ data, title, xAxisTitle, yAxisTitle, color }) => {
    const options = {
        chart: {
            type: 'bar',
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Poppins, sans-serif'
            },
            height: 350
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
            categories: data.map(item => item.name),
            title: {
                text: xAxisTitle,
                style: {
                    color: '#777'
                }
            },
            labels: {
                style: {
                    fontSize: '11px'
                }
            },
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: yAxisTitle,
                align: 'high',
                style: {
                    color: '#777'
                }
            },
            labels: {
                overflow: 'justify',
                formatter: function() {
                    return '₹' + this.value.toLocaleString();
                }
            },
            gridLineColor: '#e0e0e0',
            gridLineDashStyle: 'Dash'
        },
        tooltip: {
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
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    format: '₹{y}',
                    style: {
                        fontWeight: 'bold',
                        color: '#333'
                    }
                },
                borderRadius: 4,
                color: color || '#d4a574',
                borderWidth: 0,
                groupPadding: 0.1,
                pointPadding: 0.1,
                states: {
                    hover: {
                        brightness: 0.1
                    }
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: '#ddd',
            borderRadius: 5,
            shadow: true
        },
        series: [{
            name: 'Revenue',
            data: data.map(item => item.value),
            color: color || '#d4a574',
            showInLegend: false
        }],
        credits: {
            enabled: false
        },
        exporting: {
            enabled: true
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

export default HighchartsBarChart;
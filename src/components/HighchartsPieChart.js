import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HighchartsPieChart = ({ data, title, colors }) => {
    const defaultColors = ['#d4a574', '#8b7355', '#e8d3b9', '#b89464', '#a0845c', '#c9a87c', '#d4a574'];
    
    const options = {
        chart: {
            type: 'pie',
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
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>Value: <b>{point.y}</b>',
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
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: {
                        color: '#333',
                        fontSize: '11px',
                        fontWeight: 'normal'
                    },
                    connectorColor: '#999',
                    distance: 20
                },
                showInLegend: true,
                size: '70%',
                center: ['50%', '50%'],
                borderWidth: 0,
                states: {
                    hover: {
                        enabled: true,
                        brightness: 0.1
                    }
                }
            }
        },
        series: [{
            name: 'Orders',
            data: data.map(item => ({
                name: item.name,
                y: item.value,
                color: colors?.[data.indexOf(item)] || defaultColors[data.indexOf(item) % defaultColors.length]
            })),
            size: '80%',
            innerSize: '0%',
            dataLabels: {
                format: '{point.name}: {point.percentage:.1f}%'
            }
        }],
        credits: {
            enabled: false
        },
        exporting: {
            enabled: true
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 0,
            y: 70,
            floating: true,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 5,
            itemStyle: {
                color: '#333',
                fontWeight: 'normal',
                fontSize: '11px'
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
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                distance: 10
                            }
                        }
                    }
                }
            }]
        }
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default HighchartsPieChart;
import {  Component, OnInit } from '@angular/core';
import { Service } from 'src/app/app.restservice';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map, shareReplay } from 'rxjs/operators';
import * as Chart from 'chart.js';
import { OperatorFunction } from 'rxjs';
import * as forex_details from 'src/assets/json/forex.json' ;
import { Observable } from 'rxjs/internal/Observable';



@Component({
  selector: 'app-forex',
  templateUrl: './forex.component.html',
  styleUrls: ['./forex.component.scss']
})
export class ForexComponent implements OnInit {
  symbol_1: any = 'USD';
  symbol_2: any = 'INR';
  usable: any;
  forex_prices = [];
  indices = [];
  myChartData: any;
  ctx: any;
  canvas: any;
  public country_1: string ;
  public country_2: string ;
  forex_details:  any  = (forex_details  as  any).default;
  country_name_selected: string;
  symbol_selected: string;
  num_days : number = 7;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  temp_forex: any[];
  latest_conversion_value : number;
  converter_country_1 :number = 1;
  converter_country_2 :number ;
  latest_conversion_value_reverse: number;
 

  constructor(private http: HttpClient, private service: Service) { }


  ngOnInit(): void {
    this.getForex();
    this.loadCharts();
  }

  search_country: OperatorFunction<string, readonly {AlphabeticCode, Entity}[]> = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    map(term => term === '' ? []
      : this.forex_details.filter(v => v.Entity.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 5))
  )

  formatter1 = (x: {Entity: string, AlphabeticCode: string}) => {
    console.log("formatter 1 is being called");
    this.country_1 = x.Entity;
    this.symbol_1 = x.AlphabeticCode;
    return x.Entity;
  };

  formatter2 = (x: {Entity: string, AlphabeticCode: string}) => {
    console.log("formatter 2 is being called");
    this.country_2 = x.Entity;
    this.symbol_2 = x.AlphabeticCode;
    this.updatePage()
    return x.Entity;
  };

  swapCountries(country_1,country_2) {
    let temp2 = this.symbol_1;
    this.symbol_1 = this.symbol_2;
    this.symbol_2 = temp2;
    let temp = this.converter_country_1;
    this.converter_country_1 = this.converter_country_2;
    this.converter_country_2 = temp;
    this.getForex()
  }

  convertC1C2() {
    this.latest_conversion_value = this.temp_forex[this.temp_forex.length-1];
    this.converter_country_2 = this.latest_conversion_value * this.converter_country_1;
  }

  convertC2C1() {
    this.latest_conversion_value_reverse = 1/this.latest_conversion_value;
    this.converter_country_1 = this.latest_conversion_value_reverse * this.converter_country_2;
  }


  updatePage() {
    this.getForex();
    this.updateOptions();
  }

  getForex() {
    this.indices = [];
    this.forex_prices = [];
    let converted_values = this.service.getForex(this.symbol_1, this.symbol_2).pipe(shareReplay());
    console.log("entered susbscribe() in getForex()");
    converted_values.subscribe((data)=> {
      this.usable = data['Time Series FX (Daily)'];
      console.log("this.usable is ready: "+this.usable)
      var dates = Object.keys(this.usable);
      console.log("entered for loop");
      for(let i = 0; i<1000 && i<dates.length; i++){
        this.indices.push(dates[i]);
        this.forex_prices.push(this.usable[dates[i]]['4. close']);
      }
      this.updateOptions();
      this.convertC1C2();
    },
    (error) => {
      console.log("error is: "+ error);
    });

  }

  loadCharts(){
    this.temp_forex = this.forex_prices.slice(0,this.num_days+1);
    this.temp_forex.reverse(); 
    let temp_indices = this.indices.slice(0,this.num_days+1);
    temp_indices.reverse();
    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '1 '+this.symbol_1+' = '+this.temp_forex[0]+" "+this.symbol_2,
        color: '#fff',
        fontSize: 16,
      },
      tooltips: {
        enabled: true,
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 6,
        mode: "nearest",
        intersect: false,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          scaleLabel: {
            display: true,
            fontColor: '#000',
            fontSize: 15,
            lineHeight: 2,
            padding: 6,
            labelString: 'price in '+this.symbol_2,
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            lineWidth: 10,
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a",
            count: 10,      
          }
        }],
  
        xAxes: [{
          barPercentage: 1.6,
          scaleLabel: {
            display: true,
            fontColor: '#000',
            fontSize: 15,
            lineHeight: 1.2,
            labelString: ' 1 '+this.symbol_1,
          },
          gridLines: {
            drawBorder: true,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };
    this.canvas = <HTMLCanvasElement> document.getElementById("foreignExchangeOverTime");
    this.ctx = this.canvas.getContext("2d");
    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);
    var gradientStroke1 = this.ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors
    gradientStroke1.addColorStop(1, 'rgba(32,233,16,0.2)');
    gradientStroke1.addColorStop(0.4, 'rgba(32,233,16,0.0)');
    gradientStroke1.addColorStop(0, 'rgba(32,233,16,0)'); //green colors
    console.log("create data for chart")
    var data = {
        labels: temp_indices, 
        datasets: [{
          label: "closing price",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#ec250d',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#ec250d',
          pointBorderColor: 'rgba(255,255,255,0.2)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 4,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.temp_forex, 
        }]
      };
      console.log("creating chart")
    this.myChartData = new Chart(this.ctx, {
      type: 'line',
      data: data,
      options: gradientChartOptionsConfigurationWithTooltipRed
    });
    console.log(this.temp_forex)
    console.log(temp_indices)
  }

  public updateOptions() {
    this.temp_forex = this.forex_prices.slice(0,this.num_days+1);
    this.temp_forex.reverse();
    let temp_indices = this.indices.slice(0,this.num_days+1); 
    temp_indices.reverse();
    this.myChartData.data.datasets[0].data = this.temp_forex;
    this.myChartData.data.labels = temp_indices;
    this.myChartData.options.scales.yAxes[0].scaleLabel.labelString = 'price in '+this.symbol_2;
    this.myChartData.options.scales.xAxes[0].scaleLabel.labelString = ' 1 '+this.symbol_1;
    this.myChartData.options.title.text = '1 '+this.symbol_1+' = '+this.temp_forex[this.temp_forex.length-1]+" "+this.symbol_2+" as on "+temp_indices[temp_indices.length-1];
    this.myChartData.update();
    console.log("exitting updateOptions()");
  }

}

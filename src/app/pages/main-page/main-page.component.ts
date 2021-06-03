import { HttpClient } from '@angular/common/http';
import { Component,OnInit } from '@angular/core';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, map, shareReplay } from 'rxjs/operators';
import { Service } from 'src/app/app.restservice';
import * as company_details  from 'src/assets/json/companies_details.json' ;
import * as Chart from 'chart.js';
//import { BaseChartDirective } from 'ng2-charts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  intro_details:  any  = (company_details  as  any).default;
  daily_data$: any;
  date$ : any;
  num_days : number = 7;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  public indices = [];
  public stock_prices = [];
  usable: any;
  company_selected : any;
  company_name_selected: string = 'Alphabet (Google) Inc. Class A Common Stock';
  ticker_selected: string = 'GOOGL';
  company_description = '';
  stock_exchange: any;
  stock_currency: any;
  stock_country: any;
  stock_sector: any;
  company_netIncome: any;
  currency: any;
  profit_margin: any;
  PERatio: any;
  PEGRatio: any;
  dividend_per_share: any;
  dividend_yield: any;
  company_prev_netIncome: any;
  company_netIncome_growth: boolean = false;
  company_totalRevenue: any;
  company_prev_totalRevenue: any;
  company_totalRevenue_growth: boolean = false;
  company_prev_grossProfit: any;
  company_grossProfit: any;
  company_grossProfit_growth: boolean = false;
  company_prev_goodsAndServicesSold: any;
  company_goodsAndServicesSold: any;
  company_researchAndDevelopment: any;
  company_prev_researchAndDevelopment: any;
  company_researchAndDevelopment_growth: boolean = false;
  company_goodsAndServicesSold_growth: boolean = false;
  company_assets: any;
  company_assets_growth: boolean = false;
  company_prev_assets: any;
  company_liabilities: any;
  company_prev_liabilities: any;
  company_liabilities_growth: boolean = false;
  company_currentDebt: any;
  company_prev_currentDebt: any;
  company_currentDebt_growth: boolean = false;
  company_longTermDebt: any;
  company_prev_longTermDebt: any;
  company_longTermDebt_growth: boolean = false;
  company_totalShareholderEquity: any;
  company_prev_totalShareholderEquity: any;
  company_totalShareholderEquity_growth: boolean = false;
  company_depreciation_growth: boolean;
  company_depreciation: any;
  company_prev_depreciation: any;
  //public ctx;
  //canvas: HTMLElement;

  constructor(private http: HttpClient, private service: Service, private modalService: NgbModal) { }


  ngOnInit(): void {
    this.company_name_selected = 'Alphabet (Google) Inc. Class A Common Stock';
    console.log("Nothing happens");
    this.loadCharts();
    
    console.log("Calling getPrices() from ngOnit()");
    this.getPrices();
    console.log("Calling getCompanyOverview() from ngOnit()");
    this.getCompanyOverview();
    console.log("Calling getCashflow() from ngOnit()");
    this.getCashflow();
    console.log("Calling getIncomeStatement() from ngOnit()");
    this.getIncomeStatement();
    console.log("Calling getBalanceSheet() from ngOnit()");
    this.getBalanceSheet();
    //this.loadCharts();
  }


  search: OperatorFunction<string, readonly {Symbol, Name}[]> = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    map(term => term === '' ? []
      : this.intro_details.filter(v => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 5))
  )

  formatter = (x: {Name: string, Symbol: string, Sector: string}) => {
    console.log("formatter is being called");
    this.company_name_selected = x.Name;
    this.ticker_selected = x.Symbol;
    this.updatePage();
    return x.Name;
  };

  updatePage() {
    console.log('entered updatePage()');
    this.getPrices();
    this.getCompanyOverview();
    this.getIncomeStatement();
    this.loadCharts();
    this.updateOptions();
    this.getCashflow();
    this.getBalanceSheet();
    console.log('exitting updatePage()')
  }

  getCompanyOverview() {
    console.log('entered getCompanyOverview()');
    let overview = this.service.getCompanyOverview(this.ticker_selected).pipe(shareReplay());
    overview.subscribe((data)=> {
      this.company_description = data['Description'];
      this.stock_exchange = data['Exchange'];
      this.stock_currency = data['Currency'];
      this.stock_country = data['Country'];
      this.stock_sector = data['Sector'];
      this.profit_margin = data["ProfitMargin"];
      this.PERatio = data["PERatio"];
      this.PEGRatio = data["PEGRatio"];
      this.dividend_per_share = data["DividendPerShare"];
      this.dividend_yield =  data["DividendYield"];
      this.profit_margin = data["ProfitMargin"];
      
    });
    console.log('exitting getCompanyOverview()');
  }

  getCashflow() {
    let cashflow = this.service.getCashflow(this.ticker_selected).pipe(shareReplay());
    cashflow.subscribe((data)=> {
      this.company_netIncome = data['annualReports'][0]['netIncome'];
      this.stock_currency = data['annualReports'][0]['reportedCurrency'];
    });

  }

  getPrices() {
    console.log('entered getPrices()');
    this.indices = [];
    this.stock_prices = [];
    let resp = this.service.getPrices(this.ticker_selected).pipe(shareReplay());
    resp.subscribe((data)=> {
      this.usable = data['Time Series (Daily)'];
      var dates = Object.keys(this.usable);
      for(let i = 0; i<1000 && i<dates.length; i++){
        this.indices.push(dates[i]);
        this.stock_prices.push(this.usable[dates[i]]['4. close']);
      }
      this.updateOptions();
    },
    (error) => {
      console.log("error is: "+ error);
    });
    console.log(this.indices);
    console.log(this.ticker_selected);
    console.log(this.stock_prices);
    console.log('exiting getPrices()');
  }

  getIncomeStatement() {
    let income_statement = this.service.getIncomeStatement(this.ticker_selected).pipe(shareReplay());
    income_statement.subscribe((data)=> {
      this.company_depreciation = data['annualReports'][0]['depreciation'];
      this.company_prev_depreciation = data['annualReports'][1]['depreciation'];
      this.company_depreciation_growth = (this.company_depreciation >= this.company_prev_depreciation)? true : false;
      this.company_totalRevenue = data['annualReports'][0]['totalRevenue'];
      this.company_prev_totalRevenue = data['annualReports'][1]['totalRevenue'];
      this.company_totalRevenue_growth = (this.company_totalRevenue >= this.company_prev_totalRevenue)? true : false;
      this.company_grossProfit = data['annualReports'][0]['grossProfit'];
      this.company_prev_grossProfit = data['annualReports'][1]['grossProfit'];
      this.company_grossProfit_growth = (this.company_grossProfit >= this.company_prev_grossProfit)? true : false;
      console.log("company_netIncome:"+this.company_grossProfit);
      console.log("company_prev_netIncome:"+this.company_prev_grossProfit);
      console.log("company_netIncome_growth:"+this.company_grossProfit_growth);
      this.company_goodsAndServicesSold = data['annualReports'][0]['costofGoodsAndServicesSold'];
      this.company_prev_goodsAndServicesSold = data['annualReports'][1]['costofGoodsAndServicesSold'];
      this.company_goodsAndServicesSold_growth = (this.company_goodsAndServicesSold >= this.company_prev_goodsAndServicesSold)? true : false;
      this.company_researchAndDevelopment = data['annualReports'][0]['researchAndDevelopment'];
      this.company_prev_researchAndDevelopment = data['annualReports'][1]['researchAndDevelopment'];
      this.company_researchAndDevelopment_growth = (this.company_researchAndDevelopment >= this.company_prev_researchAndDevelopment)? true : false;
    });
  }

  getBalanceSheet() {
    let balance_sheet = this.service.getBalanceSheet(this.ticker_selected).pipe(shareReplay());
    balance_sheet.subscribe((data)=> {
      this.company_assets = data['annualReports'][0]['totalAssets'];
      this.company_prev_assets = data['annualReports'][1]['totalAssets'];
      this.company_assets_growth = (this.company_assets >= this.company_prev_assets)? true : false;
      this.company_liabilities = data['annualReports'][0]['totalLiabilities'];
      this.company_prev_liabilities = data['annualReports'][1]['totalLiabilities'];
      this.company_liabilities_growth = (this.company_liabilities >= this.company_prev_liabilities)? true : false;
      this.company_currentDebt = data['annualReports'][0]['currentDebt'];
      this.company_prev_currentDebt = data['annualReports'][1]['currentDebt'];
      this.company_currentDebt_growth = (this.company_currentDebt >= this.company_prev_currentDebt)? true : false;
      this.company_longTermDebt = data['annualReports'][0]['longTermDebt'];
      this.company_prev_longTermDebt = data['annualReports'][1]['longTermDebt'];
      this.company_longTermDebt_growth = (this.company_longTermDebt >= this.company_prev_longTermDebt)? true : false;
      this.company_totalShareholderEquity = data['annualReports'][0]['totalShareholderEquity'];
      this.company_prev_totalShareholderEquity = data['annualReports'][1]['totalShareholderEquity'];
      this.company_totalShareholderEquity_growth = (this.company_totalShareholderEquity >= this.company_prev_totalShareholderEquity)? true : false;
    });
  }

  getDailyStocks() {
    console.log("entering getDailyStocks()");
    this.indices = [];
    this.stock_prices = [];
    let resp = this.service.getPrices(this.ticker_selected).pipe(shareReplay());
    resp.subscribe((data)=> {
      this.usable = data['Time Series (Daily)'];
      var dates = Object.keys(this.usable);
      for(let i = 0; i<dates.length; i++){
        this.indices.unshift(dates[i]);
        this.stock_prices.unshift(this.usable[dates[i]]['4. close']);
      }
    },
    (error) => {
      console.log("error is: "+ error);
    });
    console.log(this.indices);
    console.log(this.ticker_selected);
    console.log(this.stock_prices);
    console.log("exiting getDailyStocks()");
  }

  openShowMore(content) {
    this.modalService.open(content, { size: 'lg' , backdropClass: '#000' });
  }


  public canvas : any;
  public ctx;
  public myChartData;

  loadCharts(){
    console.log("entered loadCharts()");
    let temp_stocks = this.stock_prices.slice(0,this.num_days+1);
    temp_stocks.reverse(); 
    let temp_indices = this.indices.slice(0,this.num_days+1);
    temp_indices.reverse();
    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
  
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a",
            //beginAtZero: true,
            //maxTicksLimit : 20,
            //max: Math.max.apply(null,this.stock_prices),
            //min: Math.min.apply(null,this.stock_prices)            
          }
        }],
  
        xAxes: [{
          barPercentage: 1.6,
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
    this.canvas = <HTMLCanvasElement> document.getElementById("stockpriceOverTime");
    this.ctx = this.canvas.getContext("2d");
  
    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);
  
    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors
      //for total shipments
    console.log(this.indices);
    console.log(this.ticker_selected);
    console.log(this.stock_prices);
    var data = {
        labels: temp_indices, //['Open', 'High', 'Low', 'Close']
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
          data: temp_stocks, //Object.values(this.latest) 
        }]
      };

    this.myChartData = new Chart(this.ctx, {
      type: 'line',
      data: data,
      options: gradientChartOptionsConfigurationWithTooltipRed
    });


    console.log("exiting loadCharts()");
  }

  public updateOptions() {
    console.log("entering updateOptions()");
    let temp_stocks = this.stock_prices.slice(0,this.num_days+1);
    temp_stocks.reverse(); 
    let temp_indices = this.indices.slice(0,this.num_days+1);
    temp_indices.reverse();
    this.myChartData.data.datasets[0].data = temp_stocks;
    this.myChartData.data.labels = temp_indices;
    this.myChartData.update();
    console.log("exiting updateOptions()");
  }



}


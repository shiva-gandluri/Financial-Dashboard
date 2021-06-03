import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Router } from '@angular/router';

const ticker_url$ = '../assets/json/companies_details.json';
const PARAMS = new HttpParams({
  fromObject: {
    action: 'opensearch',
    format: 'json',
    origin: '*'
  }
});

@Injectable()
export class Service {

  private single_association_endpoint: string = "/single-associations";
  private multi_association_endpoint: string = "/multi-associations";
  private hier_association_endpoint: string = "/hier-associations";
  private save_criteria: string = "/save-criteria";
  private match_entitiess_like: string = "/matching-entities";
  private multi_assoc_config: string = "/multi-associations-config";
  private authenticate = "/authenticate";
  private crate_columns: string = "/crate-columns";
  private is_token_valid : string = "/is-token-valid";

  hostname : string;
  portnum : string;

  constructor(private http:HttpClient, private router: Router) {
    this.portnum = window.location.port;
    if(this.portnum.valueOf()=="4200".valueOf()){
      this.portnum = "8080";
    }
    this.hostname = "http://"+window.location.hostname
                      +":"+this.portnum;
  }

  getPrices(ticker) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+
    ticker+"&outputsize=full&apikey=60JY37XTRGIVVERU");
  }

  getCompanyOverview(ticker) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=OVERVIEW&symbol="+ticker+"&apikey=60JY37XTRGIVVERU")
  }
  

  getCashflow(ticker) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=CASH_FLOW&symbol="+ticker+"&apikey=60JY37XTRGIVVERU")
  }

  getIncomeStatement(ticker) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol="+
    ticker+"&outputsize=full&apikey=60JY37XTRGIVVERU");
  }
  getBalanceSheet(ticker) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol="+
    ticker+"&outputsize=full&apikey=60JY37XTRGIVVERU");
  }

  getForex(symbol_1, symbol_2) {
    return this.http.get<any[]>
    ("https://www.alphavantage.co/query?function=FX_DAILY&from_symbol="+symbol_1+
    "&to_symbol="+symbol_2+"&apikey=60JY37XTRGIVVERU");
  }



  getPerfomanceTabData(){

    const url = this.hostname + "/performance-jdbc";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }

  getTotalShipmentsTabData(){

    const url = this.hostname + "/total-shipments-spring-data-jpa";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }
  getCompletedTasksTabData(){

    const url = this.hostname + "/completed-tasks-spring-data-jpa";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }
  getDailySalesTabData(){

    const url = this.hostname + "/daily-sales-spring-data-jpa";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }
  getMicrosoftStockPrice(){

    const url = this.hostname + "/microsoft-stock-price";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }

  getCurrentComponentName(){
    return this.router.url.substr(1);
  }

  getCrateColumns(): Observable<any> {
    return this.http.get<any>(this.hostname+this.crate_columns)
    .pipe(
      retry(1), catchError(this.errorHandl)
      )
  }

  getMatchingEntities(body): Observable<any> {

      let headers = { 'Content-Type': 'application/json' }
      
      const url = this.hostname+this.match_entitiess_like;

      return this.http.post(url, body, { headers }).pipe(
        retry(1), catchError(this.errorHandl)
        );
        
  }

  getMathingEntitiesForScroll(enteredChars, page): Observable<any> {
    
      let headers = { 'Content-Type': 'application/json' }
      const body = {
        "like":enteredChars,
        "page":page
      }
      const url = this.hostname+this.match_entitiess_like;

      return this.http.post(url, body, { headers }).pipe(
        retry(1), catchError(this.errorHandl)
        );
  }

  getSingleAssociations(): Observable<any> {

    const url = this.hostname + this.single_association_endpoint;

    let headers = { 'Content-Type': 'application/json' }
    const body = {
      "date":"2020-04-21",
      "dateCondn":">=",
      "empId":"graadmin",
      "extractFields":"machineid,accountname,ipaddress"
    }
    
    return this.http.post(url, body, { headers }).pipe(
      retry(1), catchError(this.errorHandl)
      );
  }

  getComponentConfig(){

    const url = this.hostname + "/edit-config";
    let headers = { 'Content-Type': 'application/json' }

    return this.http.get(url).pipe(
      retry(1), catchError(this.errorHandl)
      );
    
  }

  getMultiAssociations(): Observable<any> {

    const url = this.hostname + this.multi_association_endpoint;

    let headers = { 'Content-Type': 'application/json' }
    
    return this.http.post(url, null, { headers }).pipe(
      retry(1), catchError(this.errorHandl)
      );
  }

  getHierAssociations(): Observable<any> {

    const url = this.hostname + this.hier_association_endpoint;

    let headers = { 'Content-Type': 'application/json' }
    
    return this.http.post(url, null, { headers }).pipe(
      retry(1), catchError(this.errorHandl)
      );
  }

  postEditedForm(body : any){

    const url = this.hostname + this.save_criteria;

    let headers = { 'Content-Type': 'application/json' }
    
    return this.http.post(url, body, { headers }).pipe(
      retry(1), catchError(this.errorHandl)
      );
  }

  // Error handling
  errorHandl(error) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(errorMessage);
 }

}
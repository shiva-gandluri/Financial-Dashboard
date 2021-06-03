import { Routes } from "@angular/router";
import { MainPageComponent } from "src/app/pages/main-page/main-page.component";
import { ForexComponent } from "src/app/pages/forex/forex.component";


export const AdminLayoutRoutes: Routes = [
  { path: "main-page", component: MainPageComponent },
  { path: "forex", component: ForexComponent },
];

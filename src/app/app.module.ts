import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {MainSectionComponent} from './components/main-section/main-section.component';
import {HeaderComponent} from './components/header/header.component';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {MonacoEditorModule} from "ngx-monaco-editor";

@NgModule({
  declarations: [
    AppComponent,
    MainSectionComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    MonacoEditorModule.forRoot(),
    FormsModule,
    HttpClientModule

  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}

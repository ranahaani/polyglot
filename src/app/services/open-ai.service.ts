import {Injectable} from '@angular/core';
import {Configuration, OpenAIApi} from "openai";
import {environments} from "../environments";
import {filter, from, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OpenAiService {

  openAPIKey = localStorage.getItem('apiKey');

  configuration = new Configuration({
    apiKey: environments.openAIToken || this.openAPIKey!
  });

  openai = new OpenAIApi(this.configuration);

  constructor() {
    delete this.configuration.baseOptions.headers['User-Agent'];
  }


  getDataFromOpenAI(prompt: string): Observable<string> {
    return from(
      this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 256
      })
    ).pipe(
      filter(resp => !!resp && !!resp.data),
      map(resp => resp.data),
      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].text),
      map(data => data.choices[0].text)
    );
  }


}

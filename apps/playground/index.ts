// import backend functions directly in frontend :)
// end to end type safety
// works with js/ts
import { getDemoFileContent } from './demo.server';

getDemoFileContent().then(content => {
  document.getElementById('file-content')!.innerText = content;
});

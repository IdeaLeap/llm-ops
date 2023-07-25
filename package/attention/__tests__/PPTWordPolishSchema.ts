export interface PPTWordPolishResponse {
  //on the user's request to touch up the text of a PowerPoint outline and give specific scores based on the grading requirements respectively
  result: string; //ppt manuscript touch-ups result
  scores: {
    //Scoring results for outcomes based on scoring requirements
    name: string;
    score: number;
  }[];
  advice: string; //Suggestions for further improvement based on results and ratings
}

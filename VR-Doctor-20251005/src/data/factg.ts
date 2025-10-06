import { useEffect } from "react";
import { apiService } from "src/services";

export type FactItem = { code: string; text: string; reverse?: boolean; optional?: boolean };
export type Subscale = { key: 'PWB'|'SWB'|'EWB'|'FWB'; label: string; range: [number, number]; items: FactItem[]; };

export const subscales: Subscale[] = [
  {
    key:'PWB', label:'PHYSICAL WELL-BEING', range:[0,28], items:[
      {code:'GP1', text:'I have a lack of energy', reverse: true},
      {code:'GP2', text:'I have nausea', reverse: true},
      {code:'GP3', text:'Because of my physical condition, I have trouble meeting the needs of my family', reverse: true},
      {code:'GP4', text:'I have pain', reverse: true},
      {code:'GP5', text:'I am bothered by side effects of treatment', reverse: true},
      {code:'GP6', text:'I feel ill', reverse: true},
      {code:'GP7', text:'I am forced to spend time in bed', reverse: true},
    ]
  },
  {
    key:'SWB', label:'SOCIAL / FAMILY WELL-BEING', range:[0,28], items:[
      {code:'GS1', text:'I feel close to my friends'},
      {code:'GS2', text:'I get emotional support from my family'},
      {code:'GS3', text:'I get support from my friends'},
      {code:'GS4', text:'My family has accepted my illness'},
      {code:'GS5', text:'I am satisfied with family communication about my illness'},
      {code:'GS6', text:'I feel close to my partner (or the person who is my main support)'},
      {code:'GS7', text:'I am satisfied with my sex life (optional)'},
    ]
  },
  {
    key:'EWB', label:'EMOTIONAL WELL-BEING', range:[0,24], items:[
      {code:'GE1', text:'I feel sad', reverse: true},
      {code:'GE2', text:'I am satisfied with how I am coping with my illness'},
      {code:'GE3', text:'I am losing hope in the fight against my illness', reverse: true},
      {code:'GE4', text:'I feel nervous', reverse: true},
      {code:'GE5', text:'I worry about dying', reverse: true},
      {code:'GE6', text:'I worry that my condition will get worse', reverse: true},
    ]
  },
  {
    key:'FWB', label:'FUNCTIONAL WELL-BEING', range:[0,28], items:[
      {code:'GF1', text:'I am able to work (include work at home)'},
      {code:'GF2', text:'My work (include work at home) is fulfilling'},
      {code:'GF3', text:'I am able to enjoy life'},
      {code:'GF4', text:'I have accepted my illness'},
      {code:'GF5', text:'I am sleeping well'},
      {code:'GF6', text:'I am enjoying the things I usually do for fun'},
      {code:'GF7', text:'I am content with the quality of my life right now'},
    ]
  },
];





const fetchFactG = async () => {
  try {
    const response = await apiService.get("/getParticipantFactGQuestionBaseline");
    console.log("FactG data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching FactG:", error);
    return null;
  }
};



export function proratedSum(items: FactItem[], answers: Record<string, number|null>){
  const n = items.length;
  let answered = 0, sum = 0;
  items.forEach(it=>{
    const a = answers[it.code];
    if(a!==undefined && a!==null){
      answered++;
      sum += it.reverse ? (4 - a) : a;
    }
  });
  if(answered===0) return 0;
  return sum * (n / answered);
}

export function computeScores(answers: Record<string, number|null>): Record<string, number> {
  const map: Record<string, number> = {};
  subscales.forEach(sc=>{
    map[sc.key] = Math.round(proratedSum(sc.items, answers));
  });
  const total = map['PWB'] + map['SWB'] + map['EWB'] + map['FWB'];
  return { ...map, TOTAL: total };
}

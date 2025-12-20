export interface WcagResult {
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  ratio: number;
}

export const getWcagStatus = (ratio: number): WcagResult => {
  return {
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
    ratio
  };
};

export const getScoreData = (ratio: number, isLargeText: boolean) => {
    const passAA = isLargeText ? ratio >= 3 : ratio >= 4.5;
    const passAAA = isLargeText ? ratio >= 4.5 : ratio >= 7;
    
    return {
        passAA,
        passAAA,
        label: passAAA ? 'AAA' : passAA ? 'AA' : 'FAIL',
        color: passAAA ? 'green' : passAA ? 'blue' : 'red'
    };
};


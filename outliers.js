const arr = [
    {v:12},
    {v:6},
    {v:13},
    {v:8},
    {v:63},
    {v:10}
];


const mean = (array, fn) => {
    return array.reduce((a, b) => a + fn(b), 0) / array.length;
}

const std = (array, m, fn) => {
    // const m = mean(array, fn);
    return Math.sqrt(array.reduce((a, b) => a + Math.pow(fn(b) - m, 2), 0) / array.length); 
}

const filter_outliers = (array, fn) => {
    const m = mean(array, fn);
    const s = std(array, m, fn);
    const cutoff = s * 1.5; // this could be tunned
    const low = m - cutoff;
    const high = m + cutoff;

    console.log('mean: %d std: %d low: %d high: %d', m, s, low, high);

    return array.filter(x => fn(x) > low && fn(x) < high);
}

console.log(mean(arr, (i) => i.v));
// console.log(std(arr, (i) => i.v));
console.log(filter_outliers(arr, (i) => i.v));
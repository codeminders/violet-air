

const mean = (array, fn) => {
    return array.reduce((a, b) => a + fn(b), 0) / array.length;
}

const std = (array, m, fn) => {
    // const m = mean(array, fn);
    return Math.sqrt(array.reduce((a, b) => a + Math.pow(fn(b) - m, 2), 0) / array.length); 
}

module.exports.filter_outliers = (array, fn) => {

    const m = mean(array, fn);

    // if(isNaN(m)) {
    //     for (i in array) {
    //         console.log("fn " + fn(array[i]));
    //     }
    // }

    const s = std(array, m, fn);
    const cutoff = s * 1.5; // this could be tunned
    const low = m - cutoff;
    const high = m + cutoff;

    console.log('mean: %d std: %d low: %d high: %d', m, s, low, high);

    return array.filter(x => fn(x) > low && fn(x) < high);
}

// const arr = [
//     {v:12},
//     {v:6},
//     {v:13},
//     {v:8},
//     {v:63},
//     {v:10}
// ];

// const m = mean(arr, (i) => i.v);
// console.log(m);
// console.log(std(arr, m, (x) => x.v));
// console.log(module.exports.filter_outliers(arr, (i) => i.v));
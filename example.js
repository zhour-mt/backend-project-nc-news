// function countSubarrays(numbers, k) {
//     // Write your code here
//     // iterate through whole array
//     let initialCount = 0
//     // do recursion
//     //iterate through the array, and sum it up, if its less than k, initial count++
//     for (let i=0; i<numbers.length; i++){
//         if (Array.isArray(numbers[i])){
//             let product = 1
//             numbers[i].forEach((number) => {
//                 return product *= number
//             })
//             if(product <=k){
//                 initialCount++
//             }
//         }
//     }
//     return initialCount
// }

function countSubarrays(numbers, k) {
    let initialCount = 0;
    
    for (let i = 0; i < numbers.length; i++) {
        if (Array.isArray(numbers[i])) {
            let product = 1;
        
            numbers[i].forEach((number) => {
                product *= number;
            });
            
            
            if (product <= k) {
                initialCount++;
            }
        }
    }
    console.log(initialCount)
    
    return initialCount;
}

countSubarrays([[2], [3], [2,3],[2,3,4]], 6)

`SELECT profiles.first_name, profiles.last_name, profiles.email
  COUNT(deals.profile_id) AS total
  FROM profiles
  LEFT JOIN deals ON profiles.profile_id = deals.profile_id 
  GROUP BY profiles.profile_id;`
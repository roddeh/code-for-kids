export default function(subject, target = {}){
  for(let i in subject){
    target[i] = subject[i];
  }
  return target;
}
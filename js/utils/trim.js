export default function(str){
  let leading = 0;
  let trailing = str.length;

  let i = 0;
  while(str.charAt(i++) === ' '){
    leading++;
  }

  i = str.length - 1;
  while(str.charAt(i--) === ' '){
    trailing--;
  }

  return str.substr(leading, trailing - leading)
}
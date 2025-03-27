#!/bin/bash

KEY="afterUpdate(()"
grep -r -n ${KEY}   src/lib/packages/  > /var/tmp/after_grep

cat  /var/tmp/after_grep | while read line
do
   #echo $line
   param=($line)
   #echo ${param[0]}
   head=${param[0]}
   head_split=(${head//:/ })
   filepath=${head_split[0]}
   lineno=${head_split[1]}
   next_lineno=$((lineno+1))
   
   echo -e "\e[32m" $filepath  "\e[m " $lineno
   #echo $lineno
   #echo $next_lineno
   
   sed -n ${lineno}P ${filepath}
   sed -n ${next_lineno}P ${filepath}

   echo ""
done

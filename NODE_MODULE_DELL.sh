#find . -name node_modules -type d |  xargs -p rm -rf


count=0

#IFS=$'\n'
for dir in `ls -1d */`
do
   count=$((count+1))

  if  [ $count -gt 8 ]; then
     break
  fi
  find $dir  -name node_modules -type d  > n.list
  lc=`wc -l n.list | cut -d ' ' -f 1`
  echo $count  $lc  $dir
 
  if  [ $lc -gt 0 ]; then
     echo "exec"
     find $dir  -name node_modules -type d |  xargs  rm -rf
  else
     echo "skip"
  fi
  #find $dir  -name node_modules -type d |  xargs -p rm -rf
done


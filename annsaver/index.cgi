#!/bin/bash
echo Content-type:text/plain
echo
echo "ok"
read -n $CONTENT_LENGTH POST_DATA <&0
echo "$CONTENT_LENGTH is content length."
echo "$REQUEST_METHOD is request method."
echo "--"
IFS='&' read -r -a inputs <<<`echo $POST_DATA  | sed -e's/%\([0-9A-F][0-9A-F]\)/\\\\\\\\\x\1/g' | xargs echo -e`  



for element in "${inputs[@]}"; do
  IFS='=' read k v <<< $element
  if [ "$k" == "pathname" ]; then
    FILEPATH=../timestamps/`basename $v`.json
    echo -n "{" > $FILEPATH 
    pwd
    echo "you submitted stamps for $v"
    echo `basename $v`
  else
    echo "timestamps for item: $k are $v"
    echo $SEP"\"$k\":$v"  >> $FILEPATH
    SEP=","
  fi
done

echo "}" >> $FILEPATH 

 

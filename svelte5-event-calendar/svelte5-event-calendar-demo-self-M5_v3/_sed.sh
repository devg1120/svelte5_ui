

#"run(()"
#"$effect(()"


find $1 -type f -name "*.svelte" | xargs sed -i "s/run(()/\$effect(()/g"




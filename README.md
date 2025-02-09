# mbGroceryApi

To get pull and push from ssh bitbucket
eval `ssh-agent`
chmod 400 <private_key_file>
ssh-add -K <private_key_file> //-K for MAC only
ssh -T git@bitbucket.org
git clone git@bitbucket.org:morningbag/mbgroceryapi.git

To get sub module updated.

1. initialize first time
   git submodule init
2. Update command
   git submodule update

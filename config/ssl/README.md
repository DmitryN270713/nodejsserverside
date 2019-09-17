# Important note!  

For safety reasons, privateKey.key file is not uploaded to GitHub. Generate it! and change server.crt file

## To generate key pair use this command:  
```Shell
openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout ./privateKey.key -out server.crt
```
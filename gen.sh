module=$1

nest g module $module modules
nest g service $module modules --no-spec
nest g controller $module modules --no-spec
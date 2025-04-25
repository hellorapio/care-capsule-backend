module=$1

nest g mo $module global --no-spec
nest g service $module global --no-spec
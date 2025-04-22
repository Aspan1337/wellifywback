class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:123456@localhost:1234/wellifydb'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAILJET_API_KEY = "38077f95ebebf771fa78e538e48b54fd"
    MAILJET_SECRET_KEY = "59ba7b6ced053d80e099e17a46da1401"
    MAILJET_SENDER = "wellify.official@gmail.com"

import smtplib, ssl

smtp_server = "smtp.gmail.com"
port = 587  # For starttls
sender_email = "kamal@easytensor.com"
password = "weufaqyjbrtjkhrd"

# Create a secure SSL context
context = ssl.create_default_context()

# Try to log in to server and send email
try:
    server = smtplib.SMTP(smtp_server,port)
    server.ehlo() # Can be omitted
    server.starttls(context=context) # Secure the connection
    server.ehlo() # Can be omitted
    server.login(sender_email, password)

    sender_email = "app@easytensor.com"
    receiver_email = "kamal@clinc.com"
    message = """\
            Subject: Hi there

            This message is sent from Python."""
    server.sendmail(sender_email, receiver_email, message)

    # TODO: Send email here
except Exception as e:
    # Print any error messages to stdout
    print(e)
finally:
    server.quit()
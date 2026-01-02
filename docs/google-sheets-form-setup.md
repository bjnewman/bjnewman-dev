# Google Sheets Contact Form Setup

This guide walks through setting up Google Sheets to receive and store contact form submissions from the website.

## Overview

The contact form sends data to a Google Apps Script webhook, which:
1. Saves the submission to a Google Sheet
2. Sends an email notification to you
3. Returns a success response to the form

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "bjnewman.dev Contact Form Submissions"
4. In the first row, add these column headers:
   - `A1`: Timestamp
   - `B1`: Name
   - `C1`: Email
   - `D1`: Subject
   - `E1`: Message

## Step 2: Create the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name,
      data.email,
      data.subject,
      data.message
    ]);

    // Send email notification
    sendEmailNotification(data);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());

    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data) {
  // Configure your email address here
  const recipientEmail = 'your-email@example.com'; // CHANGE THIS

  const subject = '📬 New Contact Form Submission - bjnewman.dev';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007bff;">New Contact Form Submission</h2>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>From:</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
        <p style="margin: 10px 0;"><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      </div>

      <div style="background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="margin-top: 0;">Message:</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;">
          💡 <strong>Quick Reply:</strong> Click the email address above to respond directly to ${data.name}.
        </p>
      </div>
    </div>
  `;

  const plainBody = `
New Contact Form Submission

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}
Time: ${new Date(data.timestamp).toLocaleString()}

Message:
${data.message}

---
Reply to: ${data.email}
  `;

  // Send the email
  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    replyTo: data.email
  });
}

// Test function to verify the script works
function testFormSubmission() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'This is a test message to verify the form submission system works.',
    timestamp: new Date().toISOString()
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

4. **IMPORTANT**: In the `sendEmailNotification` function, change this line:
   ```javascript
   const recipientEmail = 'your-email@example.com'; // CHANGE THIS
   ```
   Replace `'your-email@example.com'` with your actual email address.

5. Save the script (File > Save or Cmd/Ctrl+S)
6. Name the project "Contact Form Handler"

## Step 3: Deploy the Apps Script

1. Click **Deploy > New deployment** (or the "Deploy" button)
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: Contact Form Webhook
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize the script**:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to Contact Form Handler (unsafe)" - this is safe because it's your own script
   - Click "Allow"
6. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/LONG_STRING_HERE/exec
   ```
   Save this URL - you'll need it in the next step!

## Step 4: Test the Script (Optional but Recommended)

Before connecting it to your website, test the script:

1. In the Apps Script editor, find the `testFormSubmission` function
2. Click the "Run" button (▶️) at the top
3. Check your email - you should receive a test notification
4. Check your Google Sheet - you should see a test row added

If both work, you're ready to connect it to your website!

## Step 5: Configure Your Website

1. Create a `.env` file in your project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add the webhook URL to your `.env` file:
   ```
   PUBLIC_FORM_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
   Replace the URL with the one you copied in Step 3.

3. Add `.env` to your `.gitignore` (should already be there):
   ```
   .env
   ```

4. Restart your dev server to pick up the environment variable:
   ```bash
   bun dev
   ```

## Step 6: Test the Contact Form

1. Start your dev server: `bun dev`
2. Go to the About page: http://localhost:4321/about
3. Fill out and submit the contact form
4. Check that:
   - ✅ You receive an email notification
   - ✅ The submission appears in your Google Sheet
   - ✅ The form shows a success message

## Troubleshooting

### Form submission fails or shows error

1. **Check the browser console** for error messages
2. **Verify the webhook URL** in your `.env` file is correct
3. **Re-deploy the Apps Script**:
   - Go to Deploy > Manage deployments
   - Click the pencil icon to edit
   - Change version to "New version"
   - Click Deploy
   - Update your `.env` with the new URL

### Not receiving email notifications

1. **Check spam folder** - Gmail sometimes filters these
2. **Verify your email** in the `sendEmailNotification` function
3. **Check Apps Script logs**:
   - In Apps Script editor, go to Executions (left sidebar)
   - Click on the most recent execution
   - Look for error messages

### Submissions not appearing in Google Sheet

1. **Check the sheet is correct** - make sure you're looking at the sheet connected to the script
2. **Verify column headers** match exactly (Timestamp, Name, Email, Subject, Message)
3. **Check Apps Script logs** for errors

### CORS errors in browser console

This is normal! The Apps Script uses `mode: 'no-cors'` which means:
- We can't read the response from the script
- The browser will show CORS warnings
- The submission still works - we just assume success

## Production Deployment

When deploying to production (Netlify, Vercel, etc.):

1. Add the environment variable in your hosting platform:
   - **Netlify**: Site settings > Environment variables
   - **Vercel**: Project settings > Environment Variables
   - **Cloudflare Pages**: Settings > Environment variables

2. Use the same variable name:
   ```
   PUBLIC_FORM_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

3. Redeploy your site to pick up the new environment variable

## Updating the Script

If you need to modify the Apps Script later:

1. Make your changes in the Apps Script editor
2. Save the changes
3. Go to **Deploy > Manage deployments**
4. Click the pencil icon ✏️ next to your deployment
5. Change **Version** to "New version"
6. Click **Deploy**
7. The URL stays the same - no need to update your `.env`!

## Security Notes

- ✅ The Apps Script webhook URL is safe to expose (it's designed for this)
- ✅ The form only accepts POST requests
- ✅ Email addresses are validated before submission
- ✅ Message length is limited to 1000 characters
- ⚠️ Keep your `.env` file in `.gitignore` to avoid committing it to git
- ⚠️ Don't share your Apps Script source code with the email address visible

## Data Privacy

- Form submissions are stored in your private Google Sheet
- Only you have access to the Google Sheet and Apps Script
- Email notifications are sent only to you
- Consider adding a privacy policy to your website if collecting user data

## Alternative: Email-Only (No Spreadsheet Storage)

If you prefer to only receive emails without storing in a spreadsheet:

Replace the `doPost` function with this simpler version:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    sendEmailNotification(data);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

This skips the spreadsheet storage and only sends emails.

# DownloadWithEmail Component Usage

This document explains how to use the reusable `DownloadWithEmail` component that provides email collection before PDF downloads.

## Features

- **Email Collection**: Collects user email before providing PDF access
- **Email Delivery**: Sends PDF download link directly to user's email
- **Dual Notifications**: Sends notifications to both user and company
- **Loading States**: Shows loading spinner during form submission
- **Error Handling**: Displays user-friendly error messages
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Consent Checkbox**: GDPR-compliant consent collection

## Usage

### 1. Import the Component

```astro
import DownloadWithEmail from "~/components/DownloadWithEmail.astro";
```

### 2. Use in Your Template

```astro
<DownloadWithEmail 
  pdfUrl="https://example.com/document.pdf" 
  title="Document Title"
  buttonText="Download PDF" 
  buttonClass="your-custom-classes"
/>
```

### 3. Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pdfUrl` | string | Yes | - | URL to the PDF file |
| `title` | string | Yes | - | Title of the document (used in emails) |
| `buttonText` | string | No | "Download PDF" | Text displayed on the button |
| `buttonClass` | string | No | Default styling | CSS classes for the button |

### 4. Example Implementation

```astro
---
import DownloadWithEmail from "~/components/DownloadWithEmail.astro";
---

<Layout title="My Page">
  <div class="container">
    <h1>Download Our Guide</h1>
    
    <DownloadWithEmail 
      pdfUrl="/assets/guide.pdf" 
      title="Complete Guide to Automation"
      buttonText="Get Free Guide"
      buttonClass="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    />
  </div>
</Layout>
```

## How It Works

1. **User clicks the download button**
2. **Email popup appears** with form fields
3. **User enters email and agrees to consent**
4. **Form submits to server action** (`downloadPdf`)
5. **Two emails are sent**:
   - Notification to company email with user details
   - Copy to user with download link
6. **PDF downloads automatically** to user's device
7. **Success message shown** to user

## Server Action

The component uses the `downloadPdf` action defined in `src/actions/index.ts`. This action:

- Validates the email input
- Sends notification email to `marketing@criticalsa.com`
- Sends PDF download link to the user's email
- Handles errors gracefully

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- Dark theme compatible
- Responsive design
- Accessible form elements
- Loading states
- Error handling

## Email Templates

### Company Notification
- **To**: marketing@criticalsa.com
- **Subject**: PDF Download Request: [Title]
- **Content**: User details and timestamp

### User Copy
- **To**: User's email
- **Subject**: Your requested PDF: [Title]
- **Content**: HTML email with download link and branding

## Error Handling

- Form validation for required fields
- Server-side error handling
- User-friendly error messages
- Graceful fallbacks

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- Focus management
- Escape key to close popup
- Proper ARIA labels
export default function generateOrderEmailHTML(orderLinks) {
    const htmlTemplate = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
              background-color: #f9f9f9;
            }
            h2 {
              color: #1a73e8;
              margin-bottom: 10px;
            }
            h3 {
              color: #333;
              margin-bottom: 15px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 10px;
              font-size: 16px;
            }
            li a {
              color: #1a73e8;
              text-decoration: none;
              font-weight: bold;
            }
            p {
              margin-top: 20px;
              font-size: 14px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <h2>Order Link</h2>
          <h3>Please download your movie from the link below:</h3>
          <ul>
            ${Object.keys(orderLinks).map(itemName => `
              <li><strong>${itemName}</strong>: <a href="${orderLinks[itemName]}" target="_blank">Click here to download</a></li>
            `).join('')}
          </ul>
          <p>Thank you for your order!</p>
        </body>
      </html>
    `;

    return htmlTemplate;
}

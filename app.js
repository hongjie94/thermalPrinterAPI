
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const { execute } = require('html2thermal');
const cors = require('cors')
const express = require('express');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8888;
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)


const getStatus = async() => {
  let printer = new ThermalPrinter({
    type: PrinterTypes.TANCA,                                 // Printer type: EPSON: 'epson', TANCA: 'tanca', STAR: 'star'
    interface: 'tcp://192.168.1.87:9100',                    // Printer interface
    characterSet: CharacterSet.PC437_USA,                      // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false,                           // Removes special characters - default: false
    lineCharacter: "=",                                       // Set character for lines - default: "-"
    breakLine: BreakLine.WORD,                                // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options:{                                                 // Additional options
      timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  });
  let isConnected = await printer.isPrinterConnected();      
  // console.log(isConnected);
  const template = ` 
    <beep/>
    <p>Lin's Asian Express</p>
    <p>520 N First Ave. Evansville IN 47710</p>
    <p>812-781-1998</p>
  `   
  return execute(printer, template);
  // printer.beep();                                             // Sound internal beeper/buzzer (if available)
  // printer.setCharacterSet("SLOVENIA");   
  // printer.println("Hello World");  
  // printer.println("Hello World"); 
  // printer.bold(true);   
  // printer.setTextSize(5,5);   
  // let execute = await printer.execute();   
  // return execute;                 // Executes all the commands. Returns success or throws error

                                 // Set text height (0-7) and width (0-7)
                         // Append text with new line
                   // Set character set - default set on init

}


app.post("/sendRecepit", (req, res) => {   
  
  const orderArr = req.body.order;
  const subTotal = req.body.subTotal;
  const tax = req.body.tax;
  const total = req.body.total;
  const today = req.body.today;
  const date = (today.split(', ')[0]);
  const time = (today.split(', ')[1]);


  console.log(orderArr);
  console.log("tax",tax);
  console.log("subTotal",subTotal);
  console.log("total", total);
  console.log(date);
  console.log(time);
  getStatus();
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server is running on ${port} `);
});

const express = require('express');
const app = express();
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');

const port = process.env.PORT || '5000';
app.listen(port, ()=> console.log("serve on broad!"))

app.use(express.json());



app.use('/', (req,res) => {
  res.send("hellow World!")
  const getStatus = async() => {
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,                                 // Printer type: EPSON: 'epson', TANCA: 'tanca', STAR: 'star'
      interface: 'tcp://192.168.0.201:9100',                    // Printer interface
      characterSet: CharacterSet.SLOVENIA,                      // Printer character set - default: SLOVENIA
      removeSpecialCharacters: false,                           // Removes special characters - default: false
      lineCharacter: "=",                                       // Set character for lines - default: "-"
      breakLine: BreakLine.WORD,                                // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
      options:{                                                 // Additional options
        timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
      }
    });
    let isConnected = await printer.isPrinterConnected();       
    console.log("read printer conection")
    console.log(isConnected);
  if(isConnected) {
      printer.print("Hello World");                               // Append text
      printer.beep();
      printer.raw(Buffer.from("Hello world"));
      printer.openCashDrawer();  
      printer.execute();
  }else {
    console.log('not connect');
  }
  }
  getStatus();
});





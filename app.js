
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const cors = require('cors')
const express = require('express');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8888;

app.options("*", cors({ origin: 'https://linspos.firebaseapp.com', optionsSuccessStatus: 200 }));
app.use(cors({ origin: "https://linspos.firebaseapp.com", optionsSuccessStatus: 200 }));

const getStatus = async(orderNumber, orderArr, tax, subTotal, total, date, time) => {
  let printer = new ThermalPrinter({
    type: PrinterTypes.TANCA,                                 // Printer type: EPSON: 'epson', TANCA: 'tanca', STAR: 'star'
    interface: 'tcp://192.168.1.87:9100',                    // Printer interface
    characterSet: CharacterSet.PC437_USA,                      // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false,                           // Removes special characters - default: false
    lineCharacter: "-",        
    width: "42",                                              // Set character for lines - default: "-"
    breakLine: BreakLine.WORD,                                // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options:{                                                 // Additional options
      timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  });
  let isConnected = await printer.isPrinterConnected();      
  isConnected ? console.log("Thermal Printer is Connected! :)"): console.log("Thermal Printer is not Connected! :(");
  
  printer.beep();                                             // Sound internal beeper/buzzer (if available)
  
  printer.alignCenter(); 
  printer.setCharacterSet("SLOVENIA"); 
  printer.bold(true);   
  printer.setTextSize(0,1); 
  printer.println("Lin's Asian Express");  
  printer.setTextNormal();  
  
  // Address and phone number
  printer.bold(false);  
  printer.println("520 N First Ave");                            
  printer.println("Evansville IN 47710");          
  printer.println("812-781-1998");  
  printer.newLine(); 
  printer.newLine(); 

  printer.setTextSize(1,1);
  printer.bold(true); 
  printer.println("# " +orderNumber.toString().substring(6));
  printer.setTextNormal();  
  printer.newLine(); 

  printer.drawLine(); 
  printer.bold(false);   

  printer.newLine(); 

  orderArr.map((item,i)=> {
    
    item.itemName.includes("Lunch") &&  (item.itemName = item.itemName.replace("Lunch ", ""));
    item.itemName.includes("Hibachi") &&  (item.itemName = item.itemName.replace("Hibachi", "HB"));
    item.itemName.includes("Chicken") &&  (item.itemName = item.itemName.replace("Chicken", "CK"));
    item.itemName.includes("Vegetable") &&  (item.itemName = item.itemName.replace("Vegetable", "Veg"));

    item.itemName.includes("(w. White Rice)") && ( item.itemName = item.itemName.replace("(w. White Rice)", "(WR)"));
    item.orderNum[0] === "L" && (item.itemName = "L) " + item.itemName);
    (item.orderNum[0] === "s" && item.orderNum !== "side_3p") && (item.itemName = item.itemName.replace("& ", "         & "));
    item.orderNum === "s12" && (item.itemName = item.itemName.replace("   & ", "& "));

    item.orderNum === "L7" &&  (item.itemName = item.itemName.replace("HB Choice of Two", "HB Choice of Two       "));
    item.orderNum === "b9" &&  (item.itemName = item.itemName.replace("Two ", "Two"));
    item.orderNum === "c9" &&  (item.itemName.includes("Fried Rice") ? item.itemName = item.itemName.replace(" (w. 2 proteins) ", " (2 proteins) ") :  item.itemName = item.itemName.replace(" (w. 2 proteins) ", " (2 proteins)    "));
    item.orderNum === "side_3p" &&  (item.itemName.includes("Fried Rice") ? item.itemName = item.itemName.replace(" (w. 3 proteins) ", " (3 proteins) ") :  item.itemName = item.itemName.replace(" (w. 3 proteins) ", " (3 proteins)    "));

  printer.tableCustom([               
    { text:`${item.qty} `, align:"LEFT" ,width:0.13 ,},
    { text:`${item.itemName}`, align:"LEFT", width:0.60 },
    { text:`$${(parseFloat(item.price) * item.qty).toFixed(2)}`, align:"RIGHT",  width:0.23}
  ]); 
    printer.newLine();
  });

  printer.newLine(); 
  printer.bold(true);

  printer.tableCustom([                                      
    { text:`Sub Total:`, align:"RIGHT", width:0.75 },
    { text:`$${subTotal}`, align:"RIGHT", cols:10 }
  ]); 
  printer.tableCustom([                                      
    { text:`Tax:`, align:"RIGHT", width:0.75 },
    { text:`$${tax}`, align:"RIGHT", cols:10 }
  ]); 

  printer.newLine();
  printer.drawLine(); 
  printer.newLine();
  printer.setTextSize(1,1);
  printer.alignCenter();
  printer.setTypeFontB();
  printer.println(`Total:    $${total}`)
  printer.newLine();
 
  printer.setTextNormal(); 

  printer.bold(true);   
  printer.drawLine(); 
  printer.bold(false); 

  printer.newLine(); 
  printer.newLine(); 
   
  // await printer.printImage('./lins.png')                       
  // printer.println("https://www.linsevv.com"); 
  // printer.newLine();
  printer.println("Thank you for dining with us!");  
  printer.println("Have a wonderful day :)");  
  printer.newLine(); 

  time.includes(" ") &&  (time = time.replace(" ", ""));
  printer.bold(true);  
  printer.println(`${date}   ${time}`); 
  printer.cut(); 

  let execute = await printer.execute();                     
  return execute;
}

app.post("/sendRecepit", (req, res) => {   
  const orderNumber = req.body.orderNumber;
  const orderArr = req.body.order;
  const subTotal = req.body.subTotal;
  const tax = req.body.tax;
  const total = req.body.total;
  const today = req.body.today;
  const date = (today.split(', ')[0]);
  const time = (today.split(', ')[1]);

  getStatus(orderNumber,orderArr, tax,subTotal,total, date, time);
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server is running on ${port} `);
});

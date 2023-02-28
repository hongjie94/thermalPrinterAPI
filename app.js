const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const cors = require('cors')
const express = require('express');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8888;

const devMode = "http://localhost:3000"
const liveMode = "https://linspos.firebaseapp.com"
app.options("*", cors({ origin: liveMode, optionsSuccessStatus: 200 }));
app.use(cors({ origin: liveMode, optionsSuccessStatus: 200 }));

// Initialize the printer
let printer = new ThermalPrinter({
  type: PrinterTypes.TANCA,                                 
  interface: 'tcp://192.168.1.87:9100',                    
  characterSet: CharacterSet.SLOVENIA,                      
  removeSpecialCharacters: false,
  lineCharacter: "-",        
  width: "42",                                             
  breakLine: BreakLine.WORD, 
  options:{                                                
    timeout: 5000                                         
  }
});

// Get printer status
const getStatus = async() => {
  let isConnected = await printer.isPrinterConnected();      
  isConnected ? console.log("Thermal Printer is Connected! :)"): console.log("Thermal Printer Failed to Connect!!! :(");
}
getStatus();

// Create recepit
const printRecepit = async(orderNumber, orderArr, tax, subTotal, total, date, time) => {
  printer.beep();  

  // Restaurant name                                           
  printer.alignCenter(); 
  printer.bold(true);   
  printer.setTextSize(0,1);  
  printer.println("Lin's Asian Express");  
  printer.setTextNormal();  
  
  // Address and phone number
  printer.bold(false);  
  printer.println("520 N First Ave");                            
  printer.println("Evansville IN 47710"); 
  printer.println("812-909-4210");         
  printer.println("812-781-1998");  
  printer.newLine(); 
  printer.newLine(); 

  // Oder Number
  printer.setTextSize(1,1);
  printer.bold(true); 
  printer.println("#" +orderNumber.toString().substring(6).padStart(3,0));
  printer.setTextNormal();  
  time.includes(" ") &&  (time = time.replace(" ", ""));
  printer.newLine(); 

  printer.bold(true); 
  printer.drawLine(); 
  printer.bold(false); 
  printer.newLine(); 
  

  // Orders
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
    item.orderNum === "party_5" && (item.itemName = item.itemName.replace("Beef & Shrimp Fried Rice ", "Beef & Shrimp Fried Rice"));
    item.orderNum === "party_6" && (item.itemName = item.itemName.replace("Beef & Shrimp Lo Mein", "Beef & Shrimp Lo Mein  "));
  printer.tableCustom([               
    { text:`${item.qty} `, align:"LEFT" ,width:0.13 ,},
    { text:`${item.itemName}`, align:"LEFT", width:0.60 },
    { text:`${(parseFloat(item.price) * item.qty).toFixed(2)}`, align:"RIGHT",  width:0.23}
  ]); 
  });

  // Sub Total & Tax
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

  // Total 
  printer.newLine();
  printer.setTextSize(1,1);
  printer.alignCenter();
  printer.setTypeFontB();
  printer.println(`Total:    $${total}`)
  printer.newLine();
 
  // Thank you 
  printer.setTextNormal(); 
  printer.bold(true);   
  printer.drawLine(); 
  printer.bold(false); 

  printer.newLine(); 
  printer.println("Thank you for dining with us!");  
  printer.println("Have a wonderful day :)");  
  printer.newLine(); 

  time.includes(" ") &&  (time = time.replace(" ", ""));
  printer.bold(true);  
  printer.println(`${date}   ${time}`); 
  printer.newLine(); 

  printer.bold(true); 
  printer.drawLine(); 
  printer.bold(false); 

  // Tip Guide 
  printer.newLine(); 
  printer.tableCustom([                                      
    { text:`Tip Guide`, align:"CENTER", cols:17},
    { text:`15% Gratuity = $${parseFloat(total * 0.15).toFixed(2)}`,  align:"LEFT", cols:25},
  ]); 
  printer.tableCustom([                                      
    { text:`         `, align:"CENTER", cols:17},
    { text:`18% Gratuity = $${parseFloat(total * 0.18).toFixed(2)}`,  align:"LEFT", cols:25}
  ]); 
  printer.tableCustom([                                      
    { text:`         `, align:"CENTER", cols:17},
    { text:`20% Gratuity = $${parseFloat(total * 0.20).toFixed(2)}`,  align:"LEFT", cols:25}
  ]); 
 
  printer.cut(); 

  let execute = await printer.execute();                     
  return execute;
}

// Api routes for printing recepit
app.post("/sendRecepit", (req, res) => {   

  const orderNumber = req.body.orderNumber;
  const orderArr = req.body.order;
  const subTotal = req.body.subTotal;
  const tax = req.body.tax;
  const total = req.body.total;
  const today = req.body.today;
  const date = (today.split(', ')[0]);
  const time = (today.split(', ')[1]);

  printRecepit(orderNumber,orderArr, tax,subTotal,total, date, time);
  res.send("ok");
});

// Api routes for open cash drawer
app.post("/openCashDrawer", (req, res) => {   
  printer.openCashDrawer();  
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} `);
});

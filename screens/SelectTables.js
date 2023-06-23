import * as React from "react";
import { TextInput,  IconButton,  DataTable,  Provider,  Button, Portal, Dialog, Avatar} from "react-native-paper";
import { View, Text, TouchableOpacity} from "react-native";
import { useState, useEffect } from "react";
import { stylesDropdown } from "../stylesDropdown";
import { ScrollView } from "react-native-gesture-handler";
import { MultiSelect } from "react-native-element-dropdown";
import { doc, setDoc, collection, getDocs, arrayUnion, updateDoc, deleteField, getDoc} from "firebase/firestore";
import { db } from "../firebase";

const SelectTables = () => {
  const [stockList, setStockList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [quantityProductOrder, setQuantityProductOrder] = useState(0);
  const [productsOrderList, setProductsOrderList] = useState([])
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedIndexTable, setSelectedIndexTable] = useState('');
  const [canAddedProd, setCanAddedProd] = useState(true);

  //DropDown
  const [selected, setSelected] = useState([]);
  const renderItem = (item) => {
    return (
      <View style={stylesDropdown.item}>
        <Text style={stylesDropdown.selectedTextStyle}>
          {item.label}
        </Text>
      </View>
    );
  };

  //Dialog for add products in order to selected table
  const [visibleDialog, setVisibleDialog] = useState(false);
  const showDialog = () => setVisibleDialog(true);
  const hideDialog = () => {setVisibleDialog(false)}

  //Dialog for view/edit order
  const [visibleDialogView, setVisibleDialogView] = useState(false);
  const showDialogView = (selectedElement) => {
    setVisibleDialogView(true);
    setSelectedTable(selectedElement);
  }
  const hideDialogView = () => setVisibleDialogView(false);



  const getStock = async () => {
    setStockList([]);
    const colRef = collection(db, "stock");
    let snapshots = await getDocs(colRef);
    let docs = snapshots.docs.map((doc) => {
      const data = doc.data();
      data.id = doc.id;
      return data;
    });

    setStockList(docs);
  };


  const getProducts = async () => {
    setProductsList([]);
    const colRef = collection(db, "products");
    let snapshots = await getDocs(colRef);
    let docs = snapshots.docs.map((doc) => {
      const data = doc.data();
      data.id = doc.id;
      data.label = data.food;
      data.price = data.sellPrice
      data.value = { label: data.food, id: data.id, sellPrice: data.sellPrice };
      return data;
    });

    setProductsList(docs);
  };

  const getOrders = async () => {
    setProductsOrderList([]);
    const colRef = collection(db, "orders");
    let snapshots = await getDocs(colRef);
    setProductsOrderList(snapshots.docs.map((doc) => {
      const data = doc.data();
      return data;
    }));
  };

 const getData = async () => {
      await getProducts();
      await getStock();
      await getOrders();
    }
    
  useEffect(() => {
   
    getData();
  }, []);


  const addProductsInOrder = async () => {
      if (selected.length > 0 && selectedIndexTable.length > 0 && selectedTable &&
         quantityProductOrder && productsList.length > 0 && stockList.length > 0 && visibleDialog) {
         let canBeInOrder = true;
         let canModifyInDatabase = true;

         const getFoodData = productsList.filter((foodElem) => 
              foodElem.food.toString().toLowerCase() === selected[0].label.toString().toLowerCase());
              
          if (getFoodData.length > 0) {
            getFoodData[0].ingredients.map(product => {
              const findProduct = stockList.filter(productElem => productElem.product.toLowerCase() === Object.keys(product)[0].toLowerCase());

              if (findProduct.length > 0) {
                  const isInStock = (+findProduct[0].quantity) - ((+quantityProductOrder) * (+product[Object.keys(product)[0]]));
                  
                  if (isInStock < 0) {
                    canBeInOrder = false;
                    canModifyInDatabase = false;
                  }
              } else {
                canBeInOrder = false;
              }
            })
          } else {
            canBeInOrder = false;
          }

          if (canBeInOrder && canModifyInDatabase) {

            const getFoodData = productsList.filter((foodElem) => 
            foodElem.food.toString().toLowerCase() === selected[0].label.toString().toLowerCase());
            
            if (getFoodData.length > 0) {
              await Promise.all(getFoodData[0].ingredients.map(product => {
                const findProduct = stockList.filter(productElem => productElem.product.toLowerCase() === Object.keys(product)[0].toLowerCase());

                if (findProduct.length > 0) {
                    const isInStock = (+findProduct[0].quantity) - ((+quantityProductOrder) * (+product[Object.keys(product)[0]]));
                    
                    if (isInStock >= 0) {
                      return new Promise(async (promise, reject) => {
                        try {
                          const response = await updateDoc(doc(
                            db,
                            "stock",
                            findProduct[0].product
                          ), {
                            quantity: isInStock
                          }, { merge: true });
                          return promise(response);
                        } catch (error) {
                          return reject(error);
                        }
                    });
                    }
                }
              })).then(async res => {
                
                await updateDoc(doc(
                  db,
                  "orders",
                  'table'
                ), {
                  [selectedIndexTable]: arrayUnion({[selected[0].id]: quantityProductOrder})
                })
                  .then(async () => {
                    console.log("order data save");
                    setSelected([]);
                    setQuantityProductOrder(0);

                    await getData();

                    setCanAddedProd(true);
                    hideDialog();   
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              })
            }
          } else {
              setCanAddedProd(false);
              setSelected([]);
              setQuantityProductOrder(0);
          }
        }
    };

  const emitRecepit = async () => {
    console.log("emit the recipe")
    if (selectedTable && selectedIndexTable) {
      let getDate = new Date().toISOString().slice(0,10).split('-');
      getDate = getDate[2] + '-' + getDate[1] + '-' + getDate[0];

      await setDoc(doc(db, "orders-complete", getDate), {}, { merge: true })

      const colRef = doc(db, "orders-complete", getDate);
      let snapshots = await getDoc(colRef);
      const docData = snapshots.data();
      console.log(docData);
      if (docData) {
        selectedTable.map(async element => {
          const product = Object.keys(element)[0];
          if (docData.hasOwnProperty(product)) {
            const oldValue = docData[product];
            let newValue = 0;
            
            newValue = (+oldValue) + (+element[product])

            await updateDoc(doc(
              db,
              "orders-complete",
              getDate
            ), {
              [product]: +newValue
            }, { merge: true })
              .then(async () => {
                console.log("order data save");

                await updateDoc(doc(
                  db,
                  "orders",
                  'table'
                ), {
                  [selectedIndexTable]: []
                })
                  .then(async () => {
                    console.log("order data save");

                    setSelected([]);
                    setSelectedIndexTable(0);
  
                    await getData();

                    hideDialogView();   
                  })
                  .catch((error) => {
                    console.log(error);
                  });
  
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            selectedTable.map(async element => {
              const product = Object.keys(element)[0];
              await updateDoc(doc(
                db,
                "orders-complete",
                getDate
              ), {
                [product]: +element[product]
              })
                .then(async () => {
                  await updateDoc(doc(
                    db,
                    "orders",
                    'table'
                  ), {
                    [selectedIndexTable]: []
                  })
                    .then(async () => {
                      console.log("order data save");

                      setSelected([]);
                      setSelectedIndexTable(0);
    
                      await getData();

                      hideDialogView();   
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                })
                .catch((error) => {
                  console.log(error);
                });
            })
          }
        })
      } else {
        selectedTable.map(async element => {
          const product = Object.keys(element)[0];

          await updateDoc(doc(
            db,
            "orders-complete",
            getDate
          ), {
            [product]: +element[product]
          })
            .then(async () => {
              await updateDoc(doc(
                db,
                "orders",
                'table'
              ), {
                [selectedIndexTable]: []
              })
                .then(async () => {
                  console.log("order data save");

                  setSelected([]);
                  setSelectedIndexTable(0);

                  await getData();

                  hideDialogView();   
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        })
      }
    }
  }

  const deleteTable = async (tableIndex) => {
    if (tableIndex) {
      await updateDoc(doc(
        db,
        "orders",
        'table'
      ), {
        [tableIndex]: deleteField(),
      })
        .then(async () => {
          console.log("product data save");
          await getOrders();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  const addTable = async () => {
    if (productsOrderList && productsOrderList.length > 0) {
      let findIndex = 1;
      Object.keys(productsOrderList[0]).map((element) => {
        if (Object.keys(productsOrderList[0]).filter(item => +item === findIndex).length === 0) {

        } else {
          findIndex++;
        }
      })
        await updateDoc(doc(
        db,
        "orders",
        'table'
      ), {
        [findIndex]: [],
      })
        .then(async () => {
          console.log("product data save");
          await getOrders();
        })
        .catch((error) => {
          console.log(error);
        });
    } 
  };

  const deleteProductFromOrder = async (productIndex) => {
    
      if (selectedIndexTable.length > 0 && productsOrderList) {
        const findIndexTable = Object.keys(productsOrderList[0])
                                  .filter(element => element.toString() === selectedIndexTable.toString());
        
        if (findIndexTable) {

          const getDeletedFood = productsOrderList[0][findIndexTable[0]].filter((element, index) => index === productIndex);

          if (getDeletedFood.length > 0) {
            const getFoodData = productsList.filter((foodElem) => 
            foodElem.food.toString().toLowerCase() === Object.keys(getDeletedFood[0])[0].toString().toLowerCase());
            
            if (getFoodData.length > 0) {
              await Promise.all(getFoodData[0].ingredients.map(product => {
                const findProduct = stockList.filter(productElem => productElem.product.toLowerCase() === Object.keys(product)[0].toLowerCase());
  
                if (findProduct.length > 0) {
                    const isInStock = (+findProduct[0].quantity) + ((+getDeletedFood[0][Object.keys(getDeletedFood[0])]) * (+product[Object.keys(product)[0]]));
                    
                    if (isInStock >= 0) {
                      return new Promise(async (promise, reject) => {
                        try {
                          const response = await updateDoc(doc(
                            db,
                            "stock",
                            findProduct[0].product
                          ), {
                            quantity: isInStock
                          }, { merge: true });
                          return promise(response);
                        } catch (error) {
                          return reject(error);
                        }
                    });
                    }
                }
              })).then(async res => {

                const newArr = productsOrderList[0][findIndexTable[0]].filter((element, index) => index !== productIndex)

                await updateDoc(doc(
                  db,
                  "orders",
                  'table'
                ), {
                  [selectedIndexTable]: newArr
                  ,
                })
                  .then(async () => {
                    console.log("product data save");
                    setSelectedTable(newArr);
                    await getData();
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              })
            }
          }
        }
      }
  }

  return (
    <Provider>
      <Portal>
        <View>
          <ScrollView>
            <DataTable>
              <DataTable.Header backgroundColor="#f1f5f3">
                <DataTable.Title >Table</DataTable.Title>
                <DataTable.Title >Status</DataTable.Title>
                <DataTable.Title numeric>View Order </DataTable.Title>
                <DataTable.Title numeric>Delete Table</DataTable.Title>
              </DataTable.Header>

              {
                //daca e si length > 0
                productsOrderList && productsOrderList.length > 0 &&
                //extragem keys pentru afisare interfata 1,2,3...
                Object.keys(productsOrderList[0])
                //eleme
                .map((element, index) => 
                  <DataTable.Row key={"datatable-row-" + index} backgroundColor="white" onPress={() => {setSelectedIndexTable(element); setSelectedTable(productsOrderList[0][element]); showDialog();}}>
                    <DataTable.Cell> 
                      <Avatar.Text size={30} label={element} style={{backgroundColor: productsOrderList[0][element].length === 0 ? "green" : "red", borderRadius:"5%"}}/>
                    </DataTable.Cell>
                    <DataTable.Cell underlayColor="#9E7CE3" >
                      {productsOrderList[0][element].length === 0 ? 'available' : 'unavailable'}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <IconButton icon="eye"  size={25}  onPress={() => { console.log("view order pressed"); setSelectedIndexTable(element); showDialogView(productsOrderList[0][element]);}}/>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <IconButton icon="delete" size={25} onPress={() => { console.log("delete table"); deleteTable(element)}}/>
                    </DataTable.Cell>
                  </DataTable.Row>
                )
              }
            </DataTable>
            <View style={{width: "35%", marginTop: "10%", marginLeft: "32%"}}>
                <Button style={{backgroundColor: '#00c04d',borderColor: "green", borderWidth: "1%", borderRadius:"25%"}} onPress={addTable}><Text style={{color: "white"}}>+ New Table</Text></Button>
            </View>
          </ScrollView>
        </View>

    {/* Dialog for add products in order to selected table */}
        <Dialog style={{backgroundColor: "#e6ede9", marginBottom:"50%"}} visible={visibleDialog} onDismiss={hideDialog}>
          <Dialog.Title>
             <Text style={{color:"#27372f", fontSize:"20", textAlign:"center"}}>Order for table</Text>
          </Dialog.Title>
          <Dialog.Content>
          <View style={stylesDropdown.container}>
              <MultiSelect
                style={stylesDropdown.dropdown}
                placeholderStyle={stylesDropdown.placeholderStyle}
                selectedTextStyle={stylesDropdown.selectedTextStyle}
                inputSearchStyle={stylesDropdown.inputSearchStyle}
                iconStyle={stylesDropdown.iconStyle}
                data={productsList}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                value={selected}
                search
                searchPlaceholder="Search..."
                maxSelect={1}
                onChange={(item) => {
                  setSelected(item);
                }}
                renderItem={renderItem}
                renderSelectedItem={(item, unSelect) => (
                  <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                    <View style={stylesDropdown.selectedStyle}>
                      <Text style={stylesDropdown.textSelectedStyle}> {item.label}  </Text>
                      <IconButton icon="delete"  color="black"  name="Safety"  size={20} />
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            <View>
              <TextInput style={{backgroundColor:"#dae5df"}} placeholder="Quantity"  value={quantityProductOrder}  onChangeText={(text) => {setQuantityProductOrder(text);}}></TextInput>
            </View>
            <View>
              {!canAddedProd && <Text style={{color: '#880808'}}>Insufficient stock</Text>}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
                 <Button onPress={() => addProductsInOrder()}><Text style={{color:"#27372f"}}>Add</Text></Button>
            <Button onPress={hideDialog}><Text style={{color:"#27372f"}}>Cancel</Text></Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Dialog for view/edit order */}
        <Dialog style={{backgroundColor: "#ffffff", marginBottom:"50%"}} visible={visibleDialogView} onDismiss={hideDialogView}>
          <Dialog.Title><Text style={{color:"#27372f", fontSize:"20", textAlign:"center"}}>Order details</Text></Dialog.Title>
          <Dialog.Content>
            <View >
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Product</DataTable.Title>
                  <DataTable.Title numeric>Quantity</DataTable.Title>
                  <DataTable.Title numeric>Price</DataTable.Title>
                  <DataTable.Title numeric>Delete</DataTable.Title>
                </DataTable.Header>
              {
                selectedTable?.map((element, index) => { return(
                <DataTable.Row key={'product-elem-' + index}>
                  <DataTable.Cell>
                    {Object.keys(element)?.[0].split("-").join(" ")}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {element[Object.keys(element)?.[0]]}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {(+productsList.find((foodElem) => foodElem.id === Object.keys(element)[0])?.price * +element[Object.keys(element)?.[0]])}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <IconButton icon="delete"  color="black"  name="Safety"  size={20} onPress={() => deleteProductFromOrder(index)}/>
                  </DataTable.Cell>
                </DataTable.Row>
                )})}
              </DataTable>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialogView}><Text style={{color:"#27372f"}}>Exit</Text></Button>
            <Button onPress={emitRecepit}><Text style={{color:"#27372f"}}>Recepit</Text></Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}

export default SelectTables;

import * as React from "react";
import {DataTable, Dialog, TextInput, IconButton, Modal, Portal, Text, Button, Provider} from "react-native-paper";
import { View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { styles } from "../styles";
import { stylesDropdown } from "../stylesDropdown";
import { ScrollView } from "react-native-gesture-handler";
import { MultiSelect } from "react-native-element-dropdown";
import {  doc,  setDoc, getDocs, collection, updateDoc, deleteDoc, arrayUnion} from "firebase/firestore";
import { db } from "../firebase";

const ProductsList = () => {
  const [stockList, setStockList] = useState([]);
  const [quantityProduct, setQuantityProduct] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [food, setFood] = useState("");
  const [sellPrice, setSellPrice] = useState(Number);
  const [filter, setFilter] = useState("");

  //modal for view the food ingredients
  const [selectedFood, setSelectedFood] = useState(null);
  const showModal = (foodElement) => {
    setSelectedFood(foodElement);
    setVisible(true);
  };
  const hideModal = () => {
    setVisible(false);
  };

  //Dialog for enter food and sellPrice
  const [visible, setVisible] = React.useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const showDialog = () => setVisibleDialog(true);
  const hideDialog = () => {
    setSellPrice(0);
    setFood("");
    setVisibleDialog(false);
  };

  //Dialog for ingredients
  const [visibleDialogIngredients, setVisibleDialogIngredients] =
    useState(false);
  const [foodDialog, setFoodDialog] = useState("");
  const showDialogIngredients = (food) => {
    setFoodDialog(food.food);
    setSellPrice(food.sellPrice);
    setVisibleDialogIngredients(true);
  };
  const hideDialogIngredients = () => {
    setVisibleDialogIngredients(false);
  };

  //DropDown
  const [selected, setSelected] = useState([]);
  const renderItem = (item) => {
    return (
      <View style={stylesDropdown.item}>
        <Text style={stylesDropdown.selectedTextStyle}>
          {item.label + " " + Math.round(item.value.value * 10) / 10  + " (Kg)"}
        </Text>
      </View>
    );
  };

  const getStock = async () => {
    setStockList([]);
    const colRef = collection(db, "stock");
    let snapshots = await getDocs(colRef);
    let docs = snapshots.docs.map((doc) => {
      const data = doc.data();
      data.id = doc.id;
      data.label = data.product;
      data.value = { label: data.product, value: data.quantity };
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
      return data;
    });
    setProductsList(docs);
  };

  useEffect(() => {
    getProducts();
    getStock();
  }, []);

  const addFood = async () => {
    if (food && sellPrice) {
      await setDoc(
        doc(db, "products", food?.toLowerCase().trim().replace(" ", "-")),
        {
          food: food,
          sellPrice: sellPrice,
          ingredients: [],
        }
      )
        .then(() => {
          console.log("product data save");
        })
        .catch((error) => {
          console.log(error);
        });

      await getProducts();
      await hideDialog();
    }
  };

  const addIngredients = async () => {
    var productsRef = doc(
      db,
      "products",
      foodDialog?.toLowerCase().trim().replace(" ", "-")
    );

    if (selected && quantityProduct && foodDialog) {
      const findElement = productsList.filter(
        (element) =>
          element.food.toLowerCase().trim().replace(" ", "-") ===
          foodDialog.toLowerCase().trim().replace(" ", "-")
      );

      if (findElement.length > -1) {
        const findIngredient = findElement[0].ingredients.filter((element) =>
          element.hasOwnProperty(selected[0].label)
        );

        if (findIngredient.length === 0) {
          await updateDoc(productsRef, {
            ingredients: arrayUnion({ [selected[0].label]: quantityProduct }),
          })
            .then(() => {
              console.log("product data save");
              setSelected([]);
              setQuantityProduct(0);
            })
            .catch((error) => {
              console.log(error);
            });
          await getProducts();
        }
      }
    }
    hideDialogIngredients();
  };

  return (
    <Provider>
      <View>
      <TextInput
            placeholder="Filter by product name"
            value={filter}
            onChangeText={(text) => {
              setFilter(text);
            }}
            style={{backgroundColor: '#f1f5f3'}}
      ></TextInput>
      </View>
      <Portal>
        <Dialog style={{backgroundColor: "#ffffff", marginBottom:"50%"}} visible={visible} onDismiss={hideModal}>
          <Dialog.Title><Text style={{color:"#27372f", fontSize:"20", textAlign:"center"}}>Product details</Text></Dialog.Title>
          <Dialog.Content>
            <View>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Ingredients</DataTable.Title>
                  <DataTable.Title numeric>Quantity(kg)</DataTable.Title>
                </DataTable.Header>
                {selectedFood &&
                  selectedFood.ingredients.map((element, index) => {
                    return (
                      <DataTable.Row key={'product-elem-' + index}>
                      <DataTable.Cell>{Object.keys(element)[0].split("-").join(" ")}</DataTable.Cell>
                      <DataTable.Cell numeric>{element[Object.keys(element)[0]]}</DataTable.Cell>
                      </DataTable.Row>
                    );
                })}
              </DataTable>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideModal}><Text style={{color:"#27372f"}}>Exit</Text></Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={visibleDialog} onDismiss={hideDialog} style={{backgroundColor: "#e6ede9", marginBottom:"50%"}}>
          <Dialog.Title>Add a new Food in list</Dialog.Title>
          <Dialog.Content>
            <View>
              <TextInput
                placeholder="Food Name"
                value={food}
                onChangeText={(text) => {
                  setFood(text);
                }}
                style={{backgroundColor: '#f1f5f3'}}
              ></TextInput>
              <TextInput
                placeholder="Sell Price "
                value={sellPrice}
                onChangeText={(text) => {
                  setSellPrice(text);
                }}
                style={{backgroundColor: '#f1f5f3'}}
              ></TextInput>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={addFood}><Text style={{color:"#27372f"}}>Save</Text></Button>
            <Button onPress={hideDialog}><Text style={{color:"#27372f"}}>Cancel</Text></Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          style={{backgroundColor: "#e6ede9", marginBottom:"50%"}}
          visible={visibleDialogIngredients}
          onDismiss={setVisibleDialogIngredients}
        >
          <Dialog.Title>
            <Text style={{color:"#27372f", fontSize:"20", textAlign:"center"}}>Add Ingredients for <>{foodDialog}</></Text>
          </Dialog.Title>
          <Dialog.Content >
            <View style={stylesDropdown.container}>
              <MultiSelect
                style={stylesDropdown.dropdown}
                placeholderStyle={stylesDropdown.placeholderStyle}
                selectedTextStyle={stylesDropdown.selectedTextStyle}
                inputSearchStyle={stylesDropdown.inputSearchStyle}
                iconStyle={stylesDropdown.iconStyle}
                data={stockList}
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
                      <Text style={stylesDropdown.textSelectedStyle}>
                        {item.label}
                      </Text>
                      <IconButton
                        icon="delete"
                        color="black"
                        name="Safety"
                        size={20}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            <View>
              <TextInput
                style={{backgroundColor:"#dae5df"}}
                placeholder="Quantity"
                value={quantityProduct}
                onChangeText={(text) => {
                  setQuantityProduct(text);
                }}
              ></TextInput>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={{color:"#c4d5cd"}}>
            <Button onPress={addIngredients}><Text>Save</Text></Button>
            <Button onPress={hideDialogIngredients}><Text>Cancel</Text></Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View>
        <ScrollView>
          <DataTable>
            <DataTable.Header style={{backgroundColor: '#ffffff'}}>
              <DataTable.Title>Food Product</DataTable.Title>
              <DataTable.Title numeric>Price</DataTable.Title>
              <DataTable.Title numeric>View </DataTable.Title>
              <DataTable.Title numeric>Delete</DataTable.Title>
            </DataTable.Header>
            {productsList
              .filter((element) =>
                filter !== ""
                  ? element.food
                      .toString()
                      .toLowerCase()
                      .trim()
                      .includes(filter.toString().toLowerCase().trim())
                  : element
              )
              .map((element, index) => {
                return (
                  <DataTable.Row
                    key={"datatable-row-" + index}
                    onPress={() => showDialogIngredients(element)} style={{backgroundColor:"#ffffff"}}
                  >
                    <DataTable.Cell>{element.food}</DataTable.Cell>
                    <DataTable.Cell numeric>{element.sellPrice}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <IconButton
                        icon="eye"
                        size={25}
                        onPress={() => showModal(element)}
                      />
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <IconButton
                        icon="delete"
                        size={25}
                        onPress={async () => {
                          await deleteDoc(
                            doc(
                              db,
                              "products",
                              element.food
                                .toLowerCase()
                                .trim()
                                .replace(" ", "-")
                            )
                          ).then(() => getProducts());
                        }}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
          </DataTable>
          <View>
            <Button
              mode="contained"
              onPress={showDialog}
              style={styles.buttonAddProduct}
            >
              + Add Food
            </Button>
          </View>
        </ScrollView>
      </View>
    </Provider>
  );
};

export default ProductsList;


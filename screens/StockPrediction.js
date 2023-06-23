import * as React from "react";
import { TextInput,  IconButton,  DataTable,  Provider,  Button, Portal, Dialog} from "react-native-paper";
import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { doc, collection, getDocs, getDoc} from "firebase/firestore";
import { db } from "../firebase";

const StockPrediction = () => {
    const [productsList, setProductsList] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [predictionList, setPredictionList] = useState([]);
    const [filter, setFilter] = useState("");
    const [quantityPredicted, setQuantityPredicted] = useState(0);

    // Dialog for view the ingredients stock
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [visibleDialogView, setVisibleDialogView] = useState(false);
    const showDialogView = (productElement, quantity) => {
        setVisibleDialogView(true);
        setQuantityPredicted(quantity);
        const findFood = productsList.filter(element => element.food.toLowerCase().trim() === productElement.toLowerCase().trim());
        setSelectedProduct(findFood.length > 0 ? findFood[0] : null);
    }
    const hideDialogView = () => setVisibleDialogView(false);

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

      const getPrediction = async () => {
        const getDate = new Date().toISOString().slice(0,10).split('-');
        setPredictionList(null);
        const colRef = doc(db, "stock-prediction", getDate[1] + '-' + getDate[2] + '-' + getDate[0]);
        let snapshots = await getDoc(colRef);
        const docData = snapshots.data();
        setPredictionList(docData);
      };

      const getData = async () => {
        await getPrediction();
        await getProducts();
        await getStock();
      }

      useEffect(() => {
        getData();
      }, []);

      const predictData = async () => {
        console.log("dataa4");
       const response = await fetch('http://192.168.0.122:8080/').then(res => res.json());
       console.log("dataa1");
       if (response) {
            await getData();
            console.log("dataa");
       }
    }

    return (
        <Provider>
                <View>
                    <ScrollView>
                        <Portal>
                        <Dialog visible={visibleDialogView} onDismiss={hideDialogView}>
                            <Dialog.Title>Ingredients:</Dialog.Title>
                            <Dialog.Content>
                                <View>
                                    {selectedProduct &&
                                    selectedProduct.ingredients.map((element, index) => {
                                    return (
                                        <Text key={"modal-text-" + index}>
                                        {Object.keys(element)[0] +
                                            "   " +
                                            Math.round((((+quantityPredicted) * (+element[Object.keys(element)[0]]))) * 10) / 10 + " Kg"}
                                        </Text>
                                    );
                                    })}
                                </View>
                            </Dialog.Content>
                        </Dialog>
                        </Portal>
                        <TextInput placeholder="Filter by product name" value={filter} onChangeText={(text) => { setFilter(text); }} style={{backgroundColor: "#f1f5f3"}}/>
                        <DataTable>
                            <DataTable.Header style={{backgroundColor: "#ffffff"}}>
                                <DataTable.Title>Product</DataTable.Title>
                                <DataTable.Title>Quantity</DataTable.Title>
                                <DataTable.Title>Date</DataTable.Title>
                                <DataTable.Title>Ingredients</DataTable.Title>
                            </DataTable.Header>
                            <>
                            {
                            predictionList &&
                            Object.keys(predictionList).length > 0 &&
                            Object.keys(predictionList)
                            .filter(element => element.toLowerCase().trim().includes(filter.toLowerCase().trim()))
                            .map((element, index1) => 
                                    <DataTable.Row key={"datatable-row-" + index1} style={{backgroundColor: "#ffffff"}}>
                                        <DataTable.Cell>{element}</DataTable.Cell>
                                        <DataTable.Cell>{predictionList[element]}</DataTable.Cell>
                                        <DataTable.Cell>{new Date().toISOString().slice(0,10)}</DataTable.Cell>
                                        <DataTable.Cell>
                                        <IconButton icon="eye" size={25} onPress={() => showDialogView(element, predictionList[element])}/>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                               )
                            }
                            </>
                        </DataTable>
                        <View style={{display:"flex", flexDirection:"row" , justifyContent:"center", padding:"10%"}}>
                            <TouchableOpacity>
                                <Button onPress={ async () => predictData()} style={{backgroundColor:"#00c04b",  padding:"3%", borderColor: "green", borderWidth: "1%", borderRadius:"25%"}}>
                                <Text style={{color:"#ffffff", fontSize:15}}>
                                    Predict Data
                                </Text>
                            </Button>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
        </Provider>
    )
}

export default StockPrediction
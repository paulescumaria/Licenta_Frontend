import { collection , getDocs} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Button, IconButton, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { db } from "../firebase";
import { MultiSelect } from "react-native-element-dropdown";
import { stylesDropdown } from "../stylesDropdown";
import { TouchableOpacity } from "react-native-gesture-handler";


const ChartScreen = () => {
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined})
    const [open, setOpen] = useState(false)
    const [rangeFormat, setRangeFormat] = useState({startDateFormat: '', endDateFormat: ''})
    const [newJson, setNewJson] = useState({});
    const [newId, setNewId] = useState({});
    const [newSale, setNewSale] = useState({});
    const [productsList, setProductsList] = useState([]);

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

    const onDismiss = React.useCallback(() => {
        setOpen(false);
      }, [setOpen]);

    const onConfirm = React.useCallback(
    ({ startDate, endDate }) => {
        setOpen(false);
        let startDateFormat = startDate.toLocaleDateString("en-GB").split("/").join("-");
        let endDateFormat = endDate.toLocaleDateString("en-GB").split("/").join("-");
        setRange({ startDate, endDate });
        setRangeFormat({ startDateFormat, endDateFormat })
        getProductsSold(startDateFormat, endDateFormat);
        getSalesReport(startDateFormat, endDateFormat);
    },
    [setOpen, setRange]
    );

    const getProducts = async () => {
        setProductsList([]);
        const colRef = collection(db, "products");
        let snapshots = await getDocs(colRef);
        let docs = snapshots.docs.map((doc) => {
          const data = doc.data();
          data.id = doc.id;
          data.label = data.food;
          data.price = data.sellPrice
          data.value = { label: data.food, id: data.id, price: data.sellPrice};
          return data;
        });
        setProductsList(docs);
    };

    const getData = async () => {
        await getProducts();
    }
      
    useEffect(() => {
      getData();
    }, []);


    const getProductsSold = async (startDate, endDate) => {
        const json = {};
        const colRef = collection(db, "orders-complete");
        let snapshots = await getDocs(colRef);
        snapshots.docs.map((doc) => {
            const id = doc.id;
            const idDate = new Date(id.split("-").reverse().join("-"));
            const strDate = new Date(startDate.split("-").reverse().join("-"));
            const enDate = new Date(endDate.split("-").reverse().join("-"));
            if ((idDate >= strDate) && (idDate <= enDate)) {
                const itemPrep = doc.data();

                Object.keys(itemPrep).map(prep => {
                    if (json.hasOwnProperty(prep)) {
                        const oldValue = json[prep];

                        json[prep] = +oldValue + +itemPrep[prep];
                    } else {
                        json[prep] = +itemPrep[prep];
                    }
                })
            }
        })
        setNewJson(json);
    }

    const getProductSold = async (startDate, endDate, selectedItem) => {
        const jsonId = {};
        const colRef = collection(db, "orders-complete");
        let snapshots = await getDocs(colRef);
        snapshots.docs.map((doc) => {
            const id = doc.id;
            const idDate = new Date(id.split("-").reverse().join("-"));
            const strDate = new Date(startDate.split("-").reverse().join("-"));
            const enDate = new Date(endDate.split("-").reverse().join("-"));
            
            if ((idDate >= strDate) && (idDate <= enDate)) {
                const itemPrep = doc.data();

                Object.keys(itemPrep).map(prep => {
                    if (prep === selectedItem?.[0]?.id) {
                        if (jsonId.hasOwnProperty(id)) {
                            const oldValue = jsonId[id];

                            jsonId[id] = +oldValue + +itemPrep[prep];
                        } else {
                            jsonId[id] = +itemPrep[prep];
                        }
                    } 
                })
            }
        })
        setNewId(jsonId);
    }

    const getSalesReport = async (startDate, endDate) => {
        const sales = {};
        const colRef = collection(db, "orders-complete");
        const colRefProducts = collection(db, "products");
        let snapshots = await getDocs(colRef);
        let snapshotsProducts = await getDocs(colRefProducts);
        snapshots.docs.map((doc) => {
            const id = doc.id;
            const idDate = new Date(id.split("-").reverse().join("-"));
            const strDate = new Date(startDate.split("-").reverse().join("-"));
            const enDate = new Date(endDate.split("-").reverse().join("-"));

            if (idDate >= strDate && idDate <= enDate) {
                const itemPrep = doc.data();
                snapshotsProducts.docs.map((docProd) => {
                    const data = docProd.data();

                    Object.keys(itemPrep).map(prep => {
                        if (prep === docProd.id) {
                            if (sales.hasOwnProperty(id)) {
                                const oldValue = +sales[id];
                                sales[id] = +oldValue + (+data.sellPrice * +itemPrep[prep]);
                            } else {
                                sales[id] = (+data.sellPrice * +itemPrep[prep]);
                            }
                        }
                    })     
                })
            }
        })
        setNewSale(sales);
    }

    return(
        <ScrollView>
            <View style={{flex: 1, alignItems: 'center'}}>
                <View style={{display:'flex', flexDirection:'row', padding:"3%", marginBottom:"5%", marginTop:"1%"}}>
                    <Button style={{marginRight:"20%", backgroundColor: '#00c04d', borderColor: "green", borderWidth: "1%", borderRadius:"25%", width:"70%"}} onPress={() => {setOpen(true)}} uppercase={false} mode="outlined">
                        <Text style={{color:"#ffffff", fontWeight:"600"}}>
                            Pick range Date
                        </Text>
                    </Button>
                    <View>
                        <Text><Text style={{fontWeight:"700", fontStyle:"italic"}}>Start: </Text>{rangeFormat.startDateFormat}</Text>
                        <Text><Text style={{fontWeight:"700", fontStyle:"italic"}}>End:</Text>   {rangeFormat.endDateFormat}</Text>
                    </View>
                </View> 
                <DatePickerModal
                    locale="en"
                    mode="range"
                    visible={open}
                    onDismiss={onDismiss}
                    startDate={range.startDate}
                    endDate={range.endDate}
                    onConfirm={onConfirm}
                />
                <View style={{display:"flex", flexDirection:"row", margin:"2%"}}>
                    <Text style={{padding:"3%", fontWeight:"500", fontStyle:"italic"}}> Quantity of products sold </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
                <ScrollView horizontal={true} style={{backgroundColor:"#ffffff"}}>
                <Text style={{position: "absolute"}}>  (Number of products)</Text>
                    <BarChart 
                        data={{
                            labels: Object.keys(newJson),
                            datasets: [{data: Object.keys(newJson).map(item => newJson[item])}]
                        }}
                        width={Object.keys(newJson).length == 0 || Object.keys(newJson).length == 1 || Object.keys(newJson).length == 2 ? Dimensions.get('window').width : 90 * Object.keys(newJson).length}
                        height={300}
                        chartConfig={{
                            count: Object.keys(newJson).length,
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: '#FFFFFF',
                            backgroundGradientTo: '#FFFFFF',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 133, 52, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style= {{
                            marginVertical: 20,
                            marginHorizontal: 10
                            }}
                    />
                </ScrollView>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
                <View style={{width: "90%", margin:"4%"}} >
                    <MultiSelect
                        style={stylesDropdown.dropdown}
                        placeholderStyle={stylesDropdown.placeholderStyle}
                        selectedTextStyle={stylesDropdown.selectedTextStyle}
                        inputSearchStyle={stylesDropdown.inputSearchStyle}
                        iconStyle={stylesDropdown.iconStyle}
                        data={productsList}
                        labelField="label"
                        valueField="value"
                        placeholder="Select a product"
                        value={selected}
                        search
                        searchPlaceholder="Search..."
                        maxSelect={1}
                        onChange={(item) => {
                        setSelected(item);
                        getProductSold(rangeFormat.startDateFormat, rangeFormat.endDateFormat, item);
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
                {/* {console.log("datasets " + (Object.keys(newId)).map(item => newId[item]))} */}
                <View style={{display:"flex", flexDirection:"row"}}>
                    <Text style={{padding:"3%", fontWeight:"500", fontStyle:"italic", margin:"2%"}}> Quantity of a selected product sold</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
                <ScrollView horizontal={true} style={{backgroundColor:"#ffffff"}}>
                <Text style={{position: "absolute"}}> (Number of products)</Text>
                    <LineChart
                        data={{
                            labels: (Object.keys(newId)),
                            datasets: [{data: Object.keys(newId)?.length > 0 ? Object.keys(newId).map(item => newId[item]) : [0]}]
                        }}
                        width={Object.keys(newId).length == 0 || Object.keys(newId).length == 1 || Object.keys(newId).length == 2 ? Dimensions.get('window').width : 90 * Object.keys(newId).length}
                        height={280}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 133, 52, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={{
                            marginVertical: 20,
                            marginHorizontal: 10
                        }}
                    />
                </ScrollView>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
                <View style={{display:"flex", flexDirection:"row", margin:"2%"}}>
                    <Text style={{padding:"3%", fontWeight:"500", fontStyle:"italic"}}> Sales Report</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
                <ScrollView horizontal={ true } style={{backgroundColor: "white"}}>
                    <Text style={{position: "absolute"}}> (Lei)</Text>
                    <LineChart
                        data={{
                            labels: (Object.keys(newSale)),
                            datasets: [
                            {
                                data: Object.keys(newSale)?.length > 0 ? Object.keys(newSale).map(item => newSale[item]) : [0],
                            },
                            ],
                        }}
                        width={Object.keys(newSale).length == 0 || Object.keys(newSale).length == 1 || Object.keys(newSale).length == 2 ? Dimensions.get('window').width : 90 * Object.keys(newSale).length} // from react-native
                        height={300}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(0, 133, 52, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        bezier
                        style={{
                            marginVertical: 20,
                            marginHorizontal: 10
                        }}
                    />
                </ScrollView>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                    <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
                </View>
            </View>  
            <View style={{marginBottom: "10%"}}></View>
        </ScrollView>
    )
}

export default ChartScreen
import { BaseToast } from "react-native-toast-message";

const toastConfig = {
    rightTop: (props: any) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: "#FF3B30", alignSelf: "flex-end", marginRight: 10 }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 15, fontWeight: "600" }}
            text2Style={{ fontSize: 13 }}
        />
    ),
};

export default toastConfig
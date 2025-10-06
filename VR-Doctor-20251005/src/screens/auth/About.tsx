import { View, Image } from "react-native";

const About = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Image
        source={require("../../../assets/About.jpg")}
        className="w-50 h-48"
        resizeMode="contain"
        style={{ width: 500, height: 458,}}
      />
    </View>
  );
};

export default About;

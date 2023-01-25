import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { HabitDay, day_size } from "../components/HabitDay";
import { Header } from "../components/Header";
import {generateDatesFromYearBeginning} from "../utils/generate-dates-from-year-beginning";
import { api } from "../lib/axios"
import { useState, useEffect, useCallback } from "react";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const daysFromYearStart = generateDatesFromYearBeginning();
const minimumSummaryDatesSizes = 18 * 5;
const ammountOfDaysToFill = minimumSummaryDatesSizes - daysFromYearStart.length;

type SummaryProps = {
    id: string;
    date: string;
    amount: number;
    completed: number;
}[]


export function Home(){
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<SummaryProps | null>(null)
    const { navigate } = useNavigation();

    async function fetchData(){
        try {
            setLoading(true);
            const response = await api.get('summary')
            setSummary(response.data);
        } catch (error) {
            Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.')
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(useCallback(()=> {
        fetchData();
    }, []))


    if(loading){
        return (
            <Loading/>
        )
    }
    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <Header/>
            <View className="flex-row mt-6 mb-2">
                {weekDays.map((weekDay, i)=>(
                    <Text key={`${weekDay}-${i}`} className="text-zinc-400 text-xl font-bold text-center mx-1" style={{width: day_size, height: day_size}}>
                        {weekDay}
                    </Text>
                ))}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
            {
                summary
                &&
                <View className="flex-row flex-wrap">
                {daysFromYearStart.map((date => {

                    const dayWithHabits = summary.find(day => {
                        return dayjs(date).isSame(day.date, 'day')
                    })

                    return (
                        (
                            <HabitDay
                            key={date.toISOString()}
                            date={date}
                            amountOfHabits={dayWithHabits?.amount}
                            amountCompleted={dayWithHabits?.completed}
                            onPress={() => navigate("habit", { date: date.toISOString() })}
                            />
                        )
                    )
                }))}
            { ammountOfDaysToFill > 0 && Array.from({length: ammountOfDaysToFill}).map((_, index) =>(
                <View 
                key={index} 
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{width: day_size, height: day_size}}
                />
            ))}
            </View>
            }
            </ScrollView>
        </View>
    )
}
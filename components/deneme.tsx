"use client"
import React from 'react'

const denemefn = async () => {
    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: "Dökümanlar rastgele değil, anlamlı birimler halinde parçalamak önemlidir. Splitterlar anlamsal bütünlüğü korur. Ana konuya odaklanılmış bir parçada daha iyi semantik arama sonuçları elde ederken, tüm bir metni elde etmek yerine konuyla alakalı bölümü elde etmek daha verimlidir." }),
    });
    const data = await response.json();
    console.log(data)

}

const Deneme = () => {
    return (
        <div>
            <button onClick={denemefn}>tıkla</button>
        </div>
    )
}

export default Deneme

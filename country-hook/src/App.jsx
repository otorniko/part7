import React, { useState, useEffect } from "react"
import axios from "axios"

const useField = type => {
    const [value, setValue] = useState("")

    const onChange = event => {
        setValue(event.target.value)
    }

    return {
        type,
        value,
        onChange,
    }
}

const useCountry = name => {
    const [data, setData] = useState(null)
    const [found, setFound] = useState(false)
    const baseUrl = "https://studies.cs.helsinki.fi/restcountries/api/name"

    useEffect(() => {
        if (name.length > 0) {
            setFound(false)

            axios
                .get(`${baseUrl}/${name}`)
                .then(response => {
                    setData({
                        name: response.data.name.common,
                        capital: response.data.capital,
                        population: response.data.population,
                        flag: response.data.flag,
                    })
                    setFound(true)
                })
                .catch(error => {
                    setData(null)
                    setFound(false)
                })
        }
    }, [name])

    return name.length > 0 ? { data, found } : null
}

const Country = ({ country }) => {
    if (!country) {
        return null
    }

    if (!country.found) {
        return <div>not found...</div>
    }

    return (
        <div>
            <h3>{country.data.name} </h3>
            <div>capital {country.data.capital} </div>
            <div>population {country.data.population}</div>
            <img
                src={country.data.flag}
                height="100"
                alt={`flag of ${country.data.name}`}
            />
        </div>
    )
}

const App = () => {
    const nameInput = useField("text")
    const [name, setName] = useState("")
    const country = useCountry(name)

    const fetch = e => {
        e.preventDefault()
        setName(nameInput.value)
    }

    return (
        <div>
            <form onSubmit={fetch}>
                <input {...nameInput} />
                <button>find</button>
            </form>

            <Country country={country} />
        </div>
    )
}

export default App

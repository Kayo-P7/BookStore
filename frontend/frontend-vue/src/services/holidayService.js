// servico de integracao externa com api de feriados nacionais
export const holidayService = {
    // consulta feriados do brasil pelo ano corrente
    getNationalHolidays: async (year = new Date().getFullYear()) => {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BR`);
        if (!response.ok) {
            throw new Error(`erro http ${response.status}`);
        }
        return response.json();
    }
};

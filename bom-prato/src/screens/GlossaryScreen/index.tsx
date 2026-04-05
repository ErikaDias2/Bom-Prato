import { useState } from 'react';
import { View, Text, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { styles } from './styles';

const glossaryData = [
  { term: "Al dente", desc: "Ponto de cozimento de massas ou vegetais onde oferecem leve resistência ao morder." },
  { term: "Banho-maria", desc: "Cozinhar ou derreter algo dentro de um recipiente que está sobre outro com água fervente." },
  { term: "Branquear", desc: "Mergulhar rapidamente um alimento em água fervente e depois em água gelada para parar o cozimento." },
  { term: "Brunoise", desc: "Corte de vegetais em cubinhos minúsculos (cerca de 3mm)." },
  { term: "Clarificar", desc: "Processo de tornar um líquido (como manteiga ou caldo) límpido, retirando suas impurezas." },
  { term: "Deglaçar", desc: "Adicionar líquido (água, vinho) à panela quente para soltar os resíduos grudados no fundo e fazer molho." },
  { term: "Julienne", desc: "Corte de vegetais em tiras finas e longas, semelhantes a palitos de fósforo." },
  { term: "Marinar", desc: "Deixar um alimento (geralmente carne) descansando em um líquido temperado para absorver sabor e amaciar." },
  { term: "Refogar", desc: "Cozinhar alimentos rapidamente em pouca gordura (óleo ou manteiga) mexendo sempre." },
  { term: "Selar", desc: "Dourar rapidamente a superfície de uma carne em fogo alto para manter os sucos no interior." }
];

export default function GlossaryScreen() {
  const [search, setSearch] = useState('');

  const filteredData = glossaryData.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Buscar termo..." 
          placeholderTextColor={theme.colors.textLight}
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.term}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.term}>{item.term}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
    </View>
  );
}
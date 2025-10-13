# Logique de Conversion AD7691

## Description du Circuit

### AD8475 - Amplificateur Différentiel
- **Gain** : 0.8 (fixe)
- **Entrée -IN0.8x** : Reliée à la masse (0V)
- **Entrée +IN0.8x** : Signal d'entrée variable (Vin)
- **VCOM** : Point médian de sortie différentielle
- **Sorties** :
  - OUT+ = VCOM + (Vin × 0.8) / 2
  - OUT- = VCOM - (Vin × 0.8) / 2

### AD7691 - Convertisseur ADC 18 bits
- **VREF** : 5V
- **VDD** : 4.9975V
- **Résolution** : 18 bits (262144 codes)
- **Entrées** :
  - IN+ = OUT+ (de l'AD8475)
  - IN- = OUT- (de l'AD8475)
- **Tension différentielle** : VDiff = IN+ - IN-

## Table de Conversion (Table 8 du Datasheet)

Avec VREF = 5V :

| Code Hex | Code Décimal | Tension Différentielle | Description |
|----------|-------------|----------------------|-------------|
| 0x1FFFF  | 131071      | +4.999962 V          | FSR - 1 LSB (Full Scale Range moins 1 LSB) |
| 0x00001  | 1           | +38.15 µV            | Midscale + 1 LSB |
| 0x00000  | 0           | 0 V                  | Midscale (point milieu) |
| 0x3FFFF  | 262143      | -38.15 µV            | Midscale - 1 LSB |
| 0x20001  | 131073      | -4.999962 V          | -FSR + 1 LSB |
| 0x20000  | 131072      | -5 V                 | -FSR (Full Scale Range négatif) |

## Algorithme de Conversion

### 1. Calcul de la tension différentielle
```
VDiff = IN+ - IN- = OUT+ - OUT-
VDiff = [VCOM + (Vin × 0.8) / 2] - [VCOM - (Vin × 0.8) / 2]
VDiff = Vin × 0.8
```

### 2. Conversion en code numérique

#### Cas 1 : Tension positive (VDiff ≥ 0)
```
Code = min(round((VDiff / VREF) × 131071), 131071)
```
- Plage : 0x00000 (0V) à 0x1FFFF (+FSR-1LSB)

#### Cas 2 : Tension négative (VDiff < 0)
```
Si |VDiff| ≥ VREF :
    Code = 0x20000 (131072)  // -FSR
Sinon :
    ratio = |VDiff| / VREF
    Code = 0x3FFFF - round(ratio × (0x3FFFF - 0x20000))
```
- Plage : 0x3FFFF (Midscale-1LSB) à 0x20000 (-FSR)

### 3. Formats de sortie
- **Décimal** : Code (0 à 262143)
- **Hexadécimal** : Code au format 0xXXXXX (5 digits)
- **Binaire** : Code au format 18 bits

## Exemples de Calcul

### Exemple 1 : VCOM = 2.5V, Vin = 2.5V
```
OUT+ = 2.5 + (2.5 × 0.8) / 2 = 2.5 + 1.0 = 3.5V
OUT- = 2.5 - (2.5 × 0.8) / 2 = 2.5 - 1.0 = 1.5V
VDiff = 3.5 - 1.5 = 2.0V

Code = round((2.0 / 5.0) × 131071) = round(52428.4) = 52428
Hex = 0xCCCC
Binary = 001100110011001100
```

### Exemple 2 : VCOM = 2.5V, Vin = 0V
```
OUT+ = 2.5 + (0 × 0.8) / 2 = 2.5V
OUT- = 2.5 - (0 × 0.8) / 2 = 2.5V
VDiff = 2.5 - 2.5 = 0V

Code = 0
Hex = 0x00000
Binary = 000000000000000000
```

### Exemple 3 : VCOM = 4.0V, Vin = 3.0V
```
OUT+ = 4.0 + (3.0 × 0.8) / 2 = 4.0 + 1.2 = 5.2V (limité à 5V par alimentation)
OUT- = 4.0 - (3.0 × 0.8) / 2 = 4.0 - 1.2 = 2.8V
VDiff = 5.0 - 2.8 = 2.2V (en pratique, limité par l'alimentation)

Code = round((2.2 / 5.0) × 131071) = round(57671.24) = 57671
Hex = 0xE147
Binary = 001110000101000111
```

## Limites et Considérations

1. **Saturation de l'AD8475** : Les sorties OUT+ et OUT- sont limitées par l'alimentation (0V à 5V)
2. **Plage de mesure optimale** : Pour éviter la saturation, ajuster VCOM en fonction de Vin
3. **Résolution** : 1 LSB ≈ 38.15 µV (VREF / 131071)
4. **Bande passante** : AD7691 = 250 kHz max (voir datasheet)

## Utilisation du Simulateur

1. Ajuster **VCOM** pour définir le point médian de la sortie différentielle
2. Ajuster **Vin (+IN0.8x)** pour définir le signal d'entrée
3. Observer les résultats :
   - Tensions IN- et IN+ de l'AD7691
   - Code de sortie en décimal, hexadécimal et binaire
4. Utiliser le graphique pour visualiser la courbe de conversion

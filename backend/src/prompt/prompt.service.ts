import { Injectable } from '@nestjs/common';
import { GameMode, PromptCategory } from '../common/types';

@Injectable()
export class PromptService {
  private readonly promptCategories: PromptCategory[] = [
    {
      name: 'Animales y Naturaleza',
      description: 'Fauna y elementos naturales',
      difficulty: 'EASY',
      educationalFocus: ['biología', 'medio ambiente', 'biodiversidad'],
      prompts: [
        'gato', 'perro', 'elefante', 'mariposa', 'árbol', 'flor', 'sol', 'luna',
        'río', 'montaña', 'bosque', 'océano', 'nube', 'estrella', 'pez', 'ave',
        'león', 'jirafa', 'pingüino', 'delfín', 'abeja', 'hormiga'
      ],
    },
    {
      name: 'Emociones y Sentimientos',
      description: 'Desarrollo emocional y social',
      difficulty: 'MEDIUM',
      educationalFocus: ['inteligencia emocional', 'comunicación', 'empatía'],
      prompts: [
        'felicidad', 'tristeza', 'miedo', 'sorpresa', 'enojo', 'amor',
        'amistad', 'cooperación', 'ayuda', 'compartir', 'respeto', 'tolerancia',
        'confianza', 'gratitud', 'perdón', 'paciencia', 'esperanza', 'calma'
      ],
    },
    {
      name: 'Ciencia y Tecnología',
      description: 'Conceptos científicos básicos',
      difficulty: 'MEDIUM',
      educationalFocus: ['ciencia', 'tecnología', 'innovación'],
      prompts: [
        'energía', 'electricidad', 'magnetismo', 'gravedad', 'átomo',
        'telescopio', 'microscopio', 'robot', 'computadora', 'internet',
        'reciclaje', 'solar', 'viento', 'agua', 'experimento', 'laboratorio'
      ],
    },
    {
      name: 'Arte y Creatividad',
      description: 'Expresión artística y cultural',
      difficulty: 'HARD',
      educationalFocus: ['arte', 'cultura', 'creatividad', 'expresión'],
      prompts: [
        'música', 'danza', 'pintura', 'escultura', 'teatro', 'poesía',
        'imaginación', 'creatividad', 'inspiración', 'belleza', 'armonía',
        'ritmo', 'color', 'forma', 'textura', 'melodía', 'historia'
      ],
    },
    {
      name: 'Valores y Sociedad',
      description: 'Conceptos sociales y cívicos',
      difficulty: 'HARD',
      educationalFocus: ['valores', 'sociedad', 'ciudadanía', 'ética'],
      prompts: [
        'justicia', 'igualdad', 'libertad', 'democracia', 'paz', 'solidaridad',
        'responsabilidad', 'honestidad', 'diversidad', 'inclusión', 'diálogo',
        'consenso', 'participación', 'comunidad', 'familia', 'escuela'
      ],
    },
    {
      name: 'Profesiones y Oficios',
      description: 'Mundo laboral y aspiraciones',
      difficulty: 'EASY',
      educationalFocus: ['trabajo', 'sociedad', 'aspiraciones'],
      prompts: [
        'médico', 'maestro', 'bombero', 'policía', 'chef', 'artista',
        'científico', 'ingeniero', 'agricultor', 'veterinario', 'piloto',
        'músico', 'escritor', 'deportista', 'constructor', 'enfermero'
      ],
    },
  ];

  private readonly sequencePrompts = [
    {
      situation: 'Preparar el desayuno',
      sequence: ['despertar', 'ir a la cocina', 'sacar ingredientes', 'cocinar', 'comer'],
    },
    {
      situation: 'Plantar un árbol',
      sequence: ['cavar hoyo', 'poner semilla', 'cubrir con tierra', 'regar', 'crecer'],
    },
    {
      situation: 'Hacer un amigo',
      sequence: ['saludar', 'presentarse', 'conversar', 'jugar juntos', 'despedirse'],
    },
    {
      situation: 'Resolver un problema',
      sequence: ['identificar problema', 'pensar soluciones', 'elegir mejor opción', 'aplicar solución', 'evaluar resultado'],
    },
    {
      situation: 'Cuidar el medio ambiente',
      sequence: ['separar basura', 'reciclar', 'ahorrar agua', 'plantar', 'educar a otros'],
    },
  ];

  private readonly wordwrapPrompts = [
    {
      word: 'amistad',
      context: 'Describe una relación especial entre personas sin usar la palabra directamente',
    },
    {
      word: 'creatividad',
      context: 'Explica el proceso de tener ideas nuevas sin mencionar la palabra',
    },
    {
      word: 'respeto',
      context: 'Describe cómo tratar bien a otros sin usar la palabra directamente',
    },
    {
      word: 'aprendizaje',
      context: 'Explica cómo adquirimos conocimientos sin usar la palabra',
    },
    {
      word: 'cooperación',
      context: 'Describe trabajar juntos para lograr algo sin mencionar la palabra',
    },
  ];

  getRandomPrompt(mode: GameMode = GameMode.CLASSIC, difficulty?: 'EASY' | 'MEDIUM' | 'HARD'): any {
    switch (mode) {
      case GameMode.CLASSIC:
        return this.getClassicPrompt(difficulty);
      case GameMode.SEQUENCE:
        return this.getSequencePrompt();
      case GameMode.WORDWRAP:
        return this.getWordwrapPrompt();
      default:
        return this.getClassicPrompt();
    }
  }

  private getClassicPrompt(difficulty?: 'EASY' | 'MEDIUM' | 'HARD') {
    let availableCategories = this.promptCategories;
    
    if (difficulty) {
      availableCategories = this.promptCategories.filter(cat => cat.difficulty === difficulty);
    }
    
    const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const prompt = category.prompts[Math.floor(Math.random() * category.prompts.length)];
    
    return {
      prompt,
      category: category.name,
      difficulty: category.difficulty,
      educationalFocus: category.educationalFocus,
      description: category.description,
    };
  }

  private getSequencePrompt() {
    const sequencePrompt = this.sequencePrompts[Math.floor(Math.random() * this.sequencePrompts.length)];
    return {
      situation: sequencePrompt.situation,
      sequence: sequencePrompt.sequence,
      description: `Dibuja 5 escenas que muestren: ${sequencePrompt.situation}`,
    };
  }

  private getWordwrapPrompt() {
    const wordwrapPrompt = this.wordwrapPrompts[Math.floor(Math.random() * this.wordwrapPrompts.length)];
    return {
      hiddenWord: wordwrapPrompt.word,
      context: wordwrapPrompt.context,
      instruction: 'Describe este concepto en máximo 20 palabras sin mencionarlo directamente',
    };
  }

  getAllCategories(): PromptCategory[] {
    return this.promptCategories;
  }

  getCategoryByName(name: string): PromptCategory | undefined {
    return this.promptCategories.find(cat => cat.name === name);
  }

  getPromptsByDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string[] {
    return this.promptCategories
      .filter(cat => cat.difficulty === difficulty)
      .flatMap(cat => cat.prompts);
  }

  getEducationalPrompts(focus: string): string[] {
    return this.promptCategories
      .filter(cat => cat.educationalFocus.includes(focus))
      .flatMap(cat => cat.prompts);
  }
}

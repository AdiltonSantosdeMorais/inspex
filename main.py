import os
import json
import datetime
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.scrollview import ScrollView
from kivy.uix.label import Label
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.utils import get_color_from_hex

# Seus dados reais vindos do HTML
PREGUNTAS_AMBULANCIA = [
    "ACEITES CON NIVEL CORRECTO Y DENTRO DE LA FECHA DE VENCIMIENTO",
    "FRENO DE LAS RUEDAS FUNCIONANDO CORRECTAMENTE - IMP",
    "FRENO DE ESTACIONAMIENTO",
    "AGUA DEL RADIADOR CON NIVEL ADECUADO",
    "LIMPIAPARABRISAS FUNCIONANDO CORRECTAMENTE",
    "KIT DE HERRAMIENTAS (LLAVE DE RUEDAS, CRIQUE, GATO, TRIANGULO)",
    "TUERCA DE FIJACIÓN DE LAS RUEDAS",
    "SISTEMA ELÉCTRICO FUNCIONANDO CORRECTAMENTE",
    "FAROS Y LUCES FUNCIONANDO CORRECTAMENTE",
    "CLAXON/CAMARA DE MARCHA ATRÁS Y ALARMA SONORA DE MARCHA ATRÁS - IMP",
    "RUEDAS SIN JUEGO EN EL VOLANTE",
    "VELOCÍMETRO/TACOGRAFO",
    "PUERTAS Y VENTANAS FUNCIONANDO CORRECTAMENTE",
    "ASIENTOS EN BUEN ESTADO",
    "ESPEJOS RETROVISORES - IMP",
    "CINTURONES DE SEGURIDAD CONSERVADOS EN TODOS OS ASIENTOS - IMP",
    "EXTINTOR DE INCENDIO VALIDO Y ADECUADO",
    "VENTILACIÓN NATURAL OR ARTIFICIAL",
    "NEUMATICOS CALIBRADOS Y EN BUEN ESTADO DE USO - IMP",
    "ALARMA Y SIRENA DE EMERGENCIA FUNCIONANDO - IMP",
    "CUÑA PARA RUEDAS",
    "CONSERVACIÓN DEL INTERIOR DEL VEHÍCULO",
    "IDENTIFICACIÓN DEL VEHÍCULO DE EMBARQUE - IMP"
]

EQUIPAMENTOS = [
    "AMBULANCIA", "CAMIÓN ALJIBE", "CAMION BETONERA", "CAMIÓN CAMA BAJA",
    "CAMIÓN DE PETROLEO", "CAMIÓN TOLVA", "CAMIONES 3/4", "ESLINGAS Y GRILLETES",
    "EXCAVADORA HIDRAULICA", "GRUA Y PLUMA", "MANIPULADORA TELESCOPICA", "MAQUINA PERFORADORA",
    "MINI RODILLO COMPACTADOR", "MINIEXCAVADORA MINI CARREGADORA", "MOTOR GENERADOR", "PLATAFORMA PTA",
    "REMOLQUE TANQUE DE PETROLEO", "RETROEXCAVADORA", "RODILLO COMPACTADOR", "TALADRO DE ROCA",
    "TRACTOR DE NEUMATICOS", "TRACTOR DE ORUGAS MOTONIVELADORA", "TRANSPORTE COLECTIVO FURGONETAS", "VEHICULOS LIGEROS CAMIONETAS"
]

class ListaScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=15, spacing=10)
        
        # Cabeçalho Inteligente
        layout.add_widget(Label(text="InspeX - SST Elecnor", font_size=24, bold=True, size_hint_y=None, height=50, color=get_color_from_hex("#003366")))
        
        # Campo de Busca Estilizado
        self.busca = TextInput(hint_text="Buscar equipamento...", size_hint_y=None, height=45, multiline=False)
        self.busca.bind(text=self.filtrar_lista)
        layout.add_widget(self.busca)
        
        # Scroll das Máquinas
        self.scroll = ScrollView()
        self.lista_layout = BoxLayout(orientation='vertical', spacing=8, size_hint_y=None)
        self.lista_layout.bind(minimum_height=self.lista_layout.setter('height'))
        
        self.atualizar_lista(EQUIPAMENTOS)
        self.scroll.add_widget(self.lista_layout)
        layout.add_widget(self.scroll)
        self.add_widget(layout)

    def atualizar_lista(self, itens):
        self.lista_layout.clear_widgets()
        for equipamento in itens:
            # Layout do Card Horizontal
            card = BoxLayout(orientation='horizontal', size_hint_y=None, height=55, spacing=10)
            
            # Botão Principal que abre o checklist
            btn = Button(text=equipamento, halign='left', valign='middle', padding_x=15,
                         background_normal='', background_color=get_color_from_hex("#0055a5"), color=(1,1,1,1), bold=True)
            btn.bind(size=btn.setter('text_size'))
            btn.bind(on_press=self.abrir_checklist)
            
            card.add_widget(btn)
            self.lista_layout.add_widget(card)

    def filtrar_lista(self, instance, text):
        itens_filtrados = [item for item in EQUIPAMENTOS if text.upper() in item.upper()]
        self.atualizar_lista(itens_filtrados)

    def abrir_checklist(self, instance):
        if instance.text == "AMBULANCIA":
            self.manager.current = 'checklist'

class ChecklistScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout_principal = BoxLayout(orientation='vertical', padding=15, spacing=10)
        
        self.layout_principal.add_widget(Label(text="Checklist: AMBULANCIA", font_size=20, bold=True, size_hint_y=None, height=40, color=get_color_from_hex("#003366")))
        
        # Campo Obrigatório de Patente
        self.input_patente = TextInput(hint_text="DIGITE AQUI A PATENTE (OBRIGATÓRIO)", size_hint_y=None, height=45, multiline=False)
        self.layout_principal.add_widget(self.input_patente)
        
        # Área de Rolagem para as 23 perguntas
        scroll = ScrollView()
        self.perguntas_layout = BoxLayout(orientation='vertical', spacing=10, size_hint_y=None)
        self.perguntas_layout.bind(minimum_height=self.perguntas_layout.setter('height'))
        
        self.respostas = {}
        
        for idx, pergunta in enumerate(PREGUNTAS_AMBULANCIA, start=1):
            item_box = BoxLayout(orientation='vertical', size_hint_y=None, height=80, padding=5)
            lbl = Label(text=f"{idx}. {pergunta}", text_size=(400, None), color=(0,0,0,1), font_size=12, size_hint_y=None, height=40)
            item_box.add_widget(lbl)
            
            # Botão de alternância Conforme / Não Conforme rápido
            btn_status = Button(text="CONFORME (C)", size_hint_y=None, height=35, background_color=get_color_from_hex("#2ecc71"))
            btn_status.bind(on_press=lambda inst, p=pergunta: self.alternar_status(inst, p))
            
            self.respostas[pergunta] = "C"
            item_box.add_widget(btn_status)
            self.perguntas_layout.add_widget(item_box)
            
        scroll.add_widget(self.perguntas_layout)
        self.layout_principal.add_widget(scroll)
        
        # Botões de Ação Inferiores
        botoes_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=50, spacing=10)
        btn_cancelar = Button(text="Cancelar", background_color=get_color_from_hex("#e74c3c"))
        btn_cancelar.bind(on_press=self.voltar)
        
        btn_salvar = Button(text="SALVAR CHECKLIST", background_color=get_color_from_hex("#2ecc71"), bold=True)
        btn_salvar.bind(on_press=self.salvar_dados)
        
        botoes_box.add_widget(btn_cancelar)
        botoes_box.add_widget(btn_salvar)
        self.layout_principal.add_widget(botoes_box)
        
        self.add_widget(self.layout_principal)

    def alternar_status(self, instance, pergunta):
        if "CONFORME" in instance.text:
            instance.text = "NO CONFORME (NC)"
            instance.background_color = get_color_from_hex("#e74c3c")
            self.respostas[pergunta] = "NC"
        else:
            instance.text = "CONFORME (C)"
            instance.background_color = get_color_from_hex("#2ecc71")
            self.respostas[pergunta] = "C"

    def voltar(self, instance):
        self.manager.current = 'lista'

    def salvar_dados(self, instance):
        if not self.input_patente.value:
            return
            
        payload = {
            "equipamento": "AMBULANCIA",
            "patente": self.input_patente.text.upper(),
            "fecha_hora": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "respostas": self.respostas
        }
        
        # Grava na raiz do Android localmente sem precisar de internet nenhuma!
        with open("inspecciones_locales.json", "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
            
        self.input_patente.text = ""
        self.manager.current = 'lista'

class InspeXApp(App):
    def build(self):
        # Força o fundo da tela a ficar cinza claro igual à imagem
        from kivy.core.window import Window
        Window.clearcolor = get_color_from_hex("#f5f7fa")
        
        sm = ScreenManager()
        sm.add_widget(ListaScreen(name='lista'))
        sm.add_widget(ChecklistScreen(name='checklist'))
        return sm

if __name__ == '__main__':
    InspeXApp().run()
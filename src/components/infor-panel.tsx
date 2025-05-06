import { Wind, Sun, Info, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import ventosol from "../../public/ventosol.jpg";

export default function InfoSection() {
  return (
    <section className="mb-8">
      <div className="flex flex-row-reverse justify-center items-center text-center mb-6 gap-3">
        {/* <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-500 via-green-600 to-yellow-500 bg-clip-text text-transparent"> */}
        <h1 className="text-5xl font-bold text-[#13576e]">VentoSol</h1>

        <Image
          className="flex h-12 w-12 rounded-sm"
          src={ventosol}
          alt="VentoSol"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-green-50">
          <TabsTrigger value="overview">Sobre</TabsTrigger>
          <TabsTrigger value="wind">Energia eólica</TabsTrigger>
          <TabsTrigger value="solar">Energia solar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Info className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Bem-vindos a VentoSol
                  </h3>
                  <p className="text-green-700 mb-4">
                    Uma plataforma interativa que demonstra como as condições
                    ambientais afetam a geração de energia renovável. Use os
                    controles abaixo para ajustar as condições de vento e solar
                    e observe seu impacto na produção de energia em tempo real.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-sky-100 p-2 rounded-full">
                        <Wind className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sky-700">
                          Energia Eólica
                        </h4>
                        <p className="text-sm text-gray-600">
                          Aproveita a energia cinética do ar em movimento para
                          gerar eletricidade por meio de turbinas.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Sun className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-700">
                          Energia Solar
                        </h4>
                        <p className="text-sm text-gray-600">
                          Converte a luz solar diretamente em eletricidade
                          utilizando painéis fotovoltaicos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg mt-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-green-700" />
                      <h4 className="font-medium text-green-800">
                        Você sabia?
                      </h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Combinar energia eólica e solar cria um sistema de energia
                      renovável mais confiável. O vento costuma soprar mais
                      forte à noite, quando a energia solar não está disponível,
                      enquanto a solar produz de forma consistente durante o
                      dia, quando o vento pode ser variável.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wind">
          <Card className="border-sky-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <Wind className="h-6 w-6 text-sky-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-sky-800 mb-2">
                    Fundamentos da Energia Eólica
                  </h3>
                  <p className="text-sky-700 mb-4">
                    A energia eólica é capturada por turbinas que convertem a
                    energia cinética do ar em movimento em energia mecânica, que
                    é então convertida em eletricidade por um gerador.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                      <h4 className="font-medium text-sky-800 mb-2">
                        Fatores Chave
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            <strong>Velocidade do Vento:</strong> Velocidades de
                            vento mais altas geram mais eletricidade, até a
                            capacidade nominal da turbina.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            <strong>Direção do Vento:</strong> As turbinas são
                            mais eficientes quando a direção do vento é
                            perpendicular ao plano do rotor.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            <strong>Densidade do Ar:</strong> DO ar mais denso
                            carrega mais energia e gera mais eletricidade.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
                      <h4 className="font-medium text-sky-800 mb-2">
                        Considerações de Eficiência
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            As turbinas eólicas modernas geralmente operam com
                            eficiência de 30-45%.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            As turbinas têm uma velocidade de corte (normalmente
                            3-4 m/s), abaixo da qual não geram energia.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-sky-200 text-sky-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            Em velocidades de vento muito altas (normalmente{" "}
                            {">"} 25 m/s), as turbinas desligam-se para evitar
                            danos.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solar">
          <Card className="border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Sun className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                    Fundamentos da Energia Solar
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Os painéis solares fotovoltaicos (PV) convertem a luz solar
                    diretamente em eletricidade utilizando materiais
                    semicondutores que exibem o efeito fotovoltaico.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Fatores Chave
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            <strong>Intensidade Solar:</strong> Maior
                            irradiância solar (intensidade da luz solar) gera
                            mais eletricidade.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            <strong>Ângulo do Painel:</strong> O ângulo ideal
                            depende da latitude, com os painéis idealmente
                            voltados diretamente para o sol.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            <strong>Cobertura de Nuvens:</strong> As nuvens
                            reduzem a quantidade de luz solar que chega aos
                            painéis, diminuindo a produção.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Considerações de Eficiência
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            Painéis solares comerciais normalmente operam com
                            eficiência de 15-22%.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            A temperatura do painel afeta a eficiência -
                            temperaturas mais altas reduzem a produção.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>
                            Mesmo em dias nublados, os painéis podem gerar de 10
                            a 25% de sua capacidade nominal.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

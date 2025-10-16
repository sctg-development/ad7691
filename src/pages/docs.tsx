import { Trans, useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  const { t } = useTranslation();

  // URL du notebook sur nbviewer (remplacez par votre repo GitHub)
  const notebookUrl = "https://nbviewer.org/github/sctg-development/ad7691/blob/main/public/debug/ntc_resistor_calculator.ipynb";

  // URL du notebook brut sur GitHub
  const githubNotebookUrl = "https://github.com/sctg-development/ad7691/blob/main/public/debug/ntc_resistor_calculator.ipynb";

  // URL pour ouvrir dans Google Colab
  const colabUrl = "https://colab.research.google.com/github/sctg-development/ad7691/blob/main/public/debug/ntc_resistor_calculator.ipynb";

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-4xl text-center justify-center">
          <h1 className={title()}>
            <Trans t={t}>docs</Trans>
          </h1>
        </div>

        {/* Options d'affichage */}
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Calculateur NTC - Options d'affichage
            </h2>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="flex flex-wrap gap-3">
              <Button
                as={Link}
                href={notebookUrl}
                target="_blank"
                color="primary"
                variant="solid"
              >
                📊 Voir sur nbviewer
              </Button>
              <Button
                as={Link}
                href={colabUrl}
                target="_blank"
                color="warning"
                variant="flat"
              >
                🔬 Ouvrir dans Google Colab
              </Button>
              <Button
                as={Link}
                href={githubNotebookUrl}
                target="_blank"
                color="default"
                variant="bordered"
              >
                📁 Voir sur GitHub
              </Button>
            </div>
            <p className="text-sm text-default-500">
              Choisissez nbviewer pour une visualisation statique rapide, ou
              Google Colab pour exécuter le notebook de manière interactive.
            </p>
          </CardBody>
        </Card>

        {/* Iframe nbviewer */}
        <Card className="w-full max-w-4xl">
          <CardBody className="p-0">
            <iframe
              src={notebookUrl}
              className="w-full h-[800px] border-0 rounded-lg"
              title="NTC Resistor Calculator Notebook"
              sandbox="allow-scripts allow-same-origin"
            />
          </CardBody>
        </Card>
      </section>
    </DefaultLayout>
  );
}
